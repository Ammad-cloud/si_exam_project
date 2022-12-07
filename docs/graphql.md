# Querying the GraphQL API

To query the GraphQL API visit:
```
https://walrus-app-5eydf.ondigitalocean.app/graphql
```

Visiting this url through a web-browser, provides you with a GUI to interact with to explore the API for querying the products.

![Picture not working](/pictures/graphql-gui-docs.png?raw=true "Playground")

Here, you can see which queries the API supports and how to query it:

![Picture not working](/pictures/query-schema.png?raw=true "Playground")


The documentation can be found inside the GraphQL Playground which can be accessed here: https://walrus-app-5eydf.ondigitalocean.app/graphql 

To get information about what queries the GraphQL server supports, Introspection (https://graphql.org/learn/introspection/) can be used for this.
Go to https://walrus-app-5eydf.ondigitalocean.app/graphql 
Run the query: 
```json
{
  __schema {
    types {
      name
      fields {
        name
        description
      }
    }
  }
}
```
Here you will see all types and fields which the GraphQL server supports querying and from that you can form your own query.
Example: 
```json
{
	products(pageNumber: 4) {
  	product_id, 
  	product_name,
    	product_price,
    	product_picture_url
	}
}
```

This will get all products on page 4.

To get a specific product with more details about it you can run the query:
```json
{
	product(id: 1) {
  	product_id, 
  	product_name,
  	product_subtitle,
    	product_price,
    	product_category,
    	product_picture_url
	}
}
```
