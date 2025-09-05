const crypto = require('crypto-js');

/**
 * Middleware para validar webhooks de Wompi
 */
const validateWompiWebhook = (req, res, next) => {
    try {
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];
        
        if (!signature || !timestamp) {
            console.error('Missing webhook headers:', { signature: !!signature, timestamp: !!timestamp });
            return res.status(400).json({ error: 'Missing required headers' });
        }

        // Validar que el timestamp no sea muy antiguo (5 minutos máximo)
        const now = Math.floor(Date.now() / 1000);
        const eventTime = parseInt(timestamp);
        
        if (Math.abs(now - eventTime) > 300) {
            console.error('Webhook timestamp too old:', { now, eventTime, diff: Math.abs(now - eventTime) });
            return res.status(400).json({ error: 'Timestamp too old' });
        }

        // Construir la cadena para validar
        const concatenatedString = `${timestamp}.${JSON.stringify(req.body)}`;
        const computedSignature = crypto.HmacSHA256(concatenatedString, process.env.WOMPI_INTEGRITY_SECRET).toString();
        
        // Wompi envía la firma como: "t=timestamp,v1=signature"
        const signatures = signature.split(',');
        const timestampFromHeader = signatures.find(s => s.startsWith('t=')).split('=')[1];
        const signatureFromHeader = signatures.find(s => s.startsWith('v1=')).split('=')[1];

        // Validar que los timestamps coincidan
        if (timestampFromHeader !== timestamp) {
            console.error('Timestamp mismatch:', { header: timestampFromHeader, expected: timestamp });
            return res.status(400).json({ error: 'Timestamp mismatch' });
        }

        // Validar la firma
        if (signatureFromHeader !== computedSignature) {
            console.error('Invalid signature:', { 
                received: signatureFromHeader, 
                computed: computedSignature,
                concatenatedString: concatenatedString.substring(0, 100) + '...' 
            });
            return res.status(401).json({ error: 'Invalid signature' });
        }

        console.log('✅ Webhook signature validated successfully');
        next();
    } catch (error) {
        console.error('Error validating webhook:', error);
        return res.status(500).json({ error: 'Validation error' });
    }
};

/**
 * Middleware para capturar el body raw para validación de firma
 */
const captureRawBody = (req, res, next) => {
    let data = '';
    req.setEncoding('utf8');
    
    req.on('data', chunk => {
        data += chunk;
    });
    
    req.on('end', () => {
        req.rawBody = data;
        try {
            req.body = JSON.parse(data);
        } catch (error) {
            req.body = {};
        }
        next();
    });
};

module.exports = {
    validateWompiWebhook,
    captureRawBody
};
