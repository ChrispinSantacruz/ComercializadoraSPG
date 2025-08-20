const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Serialización y deserialización de usuarios
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Estrategia de Google (solo si están configuradas las credenciales)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Buscar usuario existente con este Google ID
    let user = await User.findOne({ 
      proveedor: 'google', 
      proveedorId: profile.id 
    });

    if (user) {
      // Usuario ya existe, actualizar datos si es necesario
      if (profile.photos && profile.photos.length > 0) {
        user.fotoPerfilSocial = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }

    // Verificar si existe un usuario con el mismo email
    const existingUser = await User.findOne({ email: profile.emails[0].value });
    
    if (existingUser) {
      // Usuario existe con email pero sin Google, vincular cuenta
      existingUser.proveedor = 'google';
      existingUser.proveedorId = profile.id;
      if (profile.photos && profile.photos.length > 0) {
        existingUser.fotoPerfilSocial = profile.photos[0].value;
      }
      await existingUser.save();
      return done(null, existingUser);
    }

    // Crear nuevo usuario
    const newUser = new User({
      nombre: profile.displayName,
      email: profile.emails[0].value,
      proveedor: 'google',
      proveedorId: profile.id,
      fotoPerfilSocial: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
      estado: 'activo',
      verificado: true // Los usuarios de Google ya están verificados
    });

    await newUser.save();
    done(null, newUser);

  } catch (error) {
    console.error('Error en autenticación de Google:', error);
    done(error, null);
  }
  }));
} else {
  console.log('⚠️  Google OAuth no configurado (faltan GOOGLE_CLIENT_ID/SECRET)');
}

// Estrategia de Facebook (solo si están configuradas las credenciales)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Buscar usuario existente con este Facebook ID
    let user = await User.findOne({ 
      proveedor: 'facebook', 
      proveedorId: profile.id 
    });

    if (user) {
      // Usuario ya existe, actualizar datos si es necesario
      if (profile.photos && profile.photos.length > 0) {
        user.fotoPerfilSocial = profile.photos[0].value;
      }
      await user.save();
      return done(null, user);
    }

    // Verificar si existe un usuario con el mismo email
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    
    if (email) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        // Usuario existe con email pero sin Facebook, vincular cuenta
        existingUser.proveedor = 'facebook';
        existingUser.proveedorId = profile.id;
        if (profile.photos && profile.photos.length > 0) {
          existingUser.fotoPerfilSocial = profile.photos[0].value;
        }
        await existingUser.save();
        return done(null, existingUser);
      }
    }

    // Crear nuevo usuario
    const newUser = new User({
      nombre: profile.displayName,
      email: email,
      proveedor: 'facebook',
      proveedorId: profile.id,
      fotoPerfilSocial: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
      estado: 'activo',
      verificado: true // Los usuarios de Facebook ya están verificados
    });

    await newUser.save();
    done(null, newUser);

  } catch (error) {
    console.error('Error en autenticación de Facebook:', error);
    done(error, null);
  }
  }));
} else {
  console.log('⚠️  Facebook OAuth no configurado (faltan FACEBOOK_APP_ID/SECRET)');
}

module.exports = passport; 