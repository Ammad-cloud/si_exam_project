
const express = require('express')
const sqlite = require('sqlite3').verbose()
const ftp = require('basic-ftp')
const { buildSchema } = require('graphql')
const { graphqlHTTP } = require('express-graphql')
require('dotenv').config()
const port = process.env.PORT || 4000
const app = express()
const cors = require('cors')
app.use(cors())

let db = new sqlite.Database('products.db', (err) => {
    if (err) {
        console.error(err.message)
    }
    console.log('Connected to the products database.')
})

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    products(pageNumber: Int!): [Product]
    product(id: String!): Product
    searchProduct(name: String!): [Product]
    productAdditionalInfo(productId: String!): [ProductAdditionalInfo]
    productImages(productId: String!): [ProductImage]
  }
  type Product {
    id: String
    product_name: String
    product_sub_title: String
    product_description: String
    main_category: String
    sub_category: String
    price: String
    link: String
    overall_rating: String
    }
    type ProductAdditionalInfo {
    product_id: String
    additional_info: String
    choices: String
    }
    type ProductImage {
    product_id: String
    image_url: String
    alt_text: String
    additional_info: String
    }
`)

function getProducts (pageNumber) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products LIMIT 10 OFFSET 10 *  ?;  ', pageNumber, (err, rows) => {
            if (err) {
                console.log(err + 'error')
                reject(err)
            }
            console.log('resolving')
            resolve(rows)
        })
    })
}

function getProductAdditionalInfo (productId) {
    console.log('getting product' + productId)
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products_additional_info WHERE product_id = ? ', [productId], (err, rows) => {
            if (err) {
                console.log(err + 'error')
                reject(err)
            }
            console.log('resolving')
            resolve(rows)
        })
    })
}

function getProductImages (productId) {
    console.log('getting product' + productId)
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM product_images WHERE product_id = ? ', [productId], (err, rows) => {
            if (err) {
                console.log(err + 'error')
                reject(err)
            }
            console.log('resolving')
            resolve(rows)
        })
    })
}

function getProductByName (name) {
    console.log('getting product' + name)
    const pattern = '%' + name + '%'
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products WHERE product_name like ? ', [pattern], (err, row) => {
            if (err) {
                console.log(err + 'error')
                reject(err)
            }
            console.log('resolving')
            resolve(row)
        })
    })
}

function getProduct (id) {
    console.log('getting product' + id)
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.log(err + 'error')
                reject(err)
            }
            console.log('resolving')
            resolve(row)
        })
    })
}


// The rootValue provides a resolver function for each API endpoint
const rootValue = {
    products: (args) => {
        return getProducts(args.pageNumber).then((result) => { return result })
    },

    product: (args) => {
        return getProduct(args.id).then((result) => { return result })
    },

    searchProduct: (args) => {
        return getProductByName(args.name).then((result) => { return result })
    },

    productAdditionalInfo: (args) => {
        return getProductAdditionalInfo(args.productId).then((result) => { return result })
    },

    productImages: (args) => {
        return getProductImages(args.productId).then((result) => { return result })
    }

}

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue,
    graphiql: true
}))

async function updateDatabase () {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: process.env.FTPHOST,
            user: process.env.FTPUSER,
            password: process.env.FTPPASSWORD,
            secure: process.env.FTPSECURE
        })
        await client.downloadTo('products.db', 'files/products.db')
    } catch (err) {
        console.log(err)
    }
    client.close()
}
app.post('/update', function (req, res) {
    updateDatabase().then(
        db = new sqlite.Database('products.db', (err) => {
            if (err) {
                console.error(err.message)
            }else {
                console.log('Connected to the updated products database.')
                res.send('updated database on graphql server')
            }
        })
    )
})

app.listen(port, () => console.log(`Now browse to localhost:${port}/graphql`))
