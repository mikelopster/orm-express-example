const express = require('express')
const mysql = require('mysql2/promise')
const { Sequelize, DataTypes } = require('sequelize')

const app = express()
app.use(express.json())

const port = 8000

let conn = null

// function init connection mysql
const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'tutorial'
  })
}


// use sequenlize
const sequelize = new Sequelize('tutorial', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql'
})

// ทั้งสร้างและ validation
const User = sequelize.define('users', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    }
  }
}, {})

// เพิ่ม table address เข้ามา
const Address = sequelize.define('addresses', {
  address1: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {})

// ประกาศ relation แบบปกติ
// User.hasMany(Address)

// relation แบบผูกติด (จะสามารถลบไปพร้อมกันได้) = พิจารณาเป็น case by case ไป
User.hasMany(Address, { onDelete: 'CASCADE' })

Address.belongsTo(User)

app.get('/api/users', async (req, res) => {
  try {
    // แบบ Query แบบเก่า
    // const [result] = await conn.query('SELECT * from users')

    // query ผ่าน model แทน
    const users = await User.findAll()
    res.json(users)
  } catch (err) {
    console.error(err)
  }
})

app.get('/api/users/:id/address', async (req, res) => {
  try {
    const userId = req.params.id
    // แบบ Query แบบเก่า
    // const [result] = await conn.query('SELECT users.*, addresses.address1 FROM users LEFT JOIN addresses on users.id = addresses.userId WHERE users.id = ?', userId)

    // query ผ่าน model แทน
    const result = await User.findOne({
      where: { id: userId },
    }).getAddresses()

    // หรือจะใช้กับ findAll ก็ได้
    // const result = await User.findAll({
    //   where: { id: userId },
    //   include: {
    //     model: Address
    //   },
    //   // raw: true ใส่เพื่อให้เหมือน LEFT JOIN
    // })

    res.json(result)
  } catch (err) {
    console.error(err)
    res.json(err)
  }
})

app.post('/api/users', async (req, res) => {
  try {
    const data = req.body
    // แบบ Query แบบเก่า
    // const [result] = await conn.query('INSERT INTO users SET ?', data)

    // ท่า Model
    const users = await User.create(data)
    res.json(users)
  } catch (err) {
    console.error(err)
    res.json({
      message: 'something went wrong',
      error: err.errors.map(e => e.message)
    })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const data = req.body
    const userId = req.params.id
    // แบบ Query แบบเก่า
    //  const result = await conn.query('UPDATE users SET ? WHERE id = ?', [data, id])

    // ท่า Model
    const users = await User.update(data, {
      where: { id: userId }
    })
    res.json({
      message: 'update complete!',
      users
    })
  } catch (err) {
    console.error(err)
    res.json({
      message: 'something went wrong',
      error: err.errors.map(e => e.message)
    })
  }
})

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id
    // แบบ Query แบบเก่า
    // const [result] = await conn.query('DELETE FROM users WHERE id = ?', [id])

    // query ผ่าน model แทน
    const result = await User.destroy({
      where: { id: userId }
    })


    res.json({
      message: 'delete successful',
      result
    })
  } catch (err) {
    console.error(err)
    res.json(err)
  }
})

// Listen
app.listen(port, async () => {
  await initMySQL()
  await sequelize.sync()
  // await sequelize.sync({ force: true })

  console.log('Server started at port 8000')
})