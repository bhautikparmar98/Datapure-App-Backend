import bcrypt from 'bcryptjs';

const getHashedPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, 8);
  return hashedPassword;
};

export default { getHashedPassword };
