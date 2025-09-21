import jwt from 'jsonwebtoken';

const genToken = (userId) => {
 try{
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
 } catch (error) {
    throw new Error("Token generation failed");
 }
}

export default genToken;