import db from '../../models/index.js'

const { Manager } = db;

class ManagerController{
  async store(req, res){
    const { full_name, username, password } = req.body

    try {
      const existingManager = await Manager.findOne({
        where:{
          username,
        }
      });

      if(existingManager){
        return res.status(400).json({ message: 'Esse nome de usuário já existe.' });
      } else {
        const newManager = await Manager.create({ full_name, username, password });

        return res.status(200).json(newManager);
      }
    } catch (error) {
      console.error(req.body);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor',
        details: error.message
      });
    }
  }

  async index(req, res) {
    try {
      const managers = await Manager.findAll();

      return res.status(200).json(managers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ocorreu um erro no servidor',
        details: error.message
      });
    }
  }
}

export default new ManagerController();