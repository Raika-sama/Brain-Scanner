const bcrypt = require('bcrypt');

async function hashPassword() {
    const password = '12345'; // La password che vuoi impostare
    const hash = await bcrypt.hash(password, 10);
    console.log('Hash della password:', hash);
}

hashPassword();