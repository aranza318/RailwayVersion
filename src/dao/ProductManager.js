import { transporter } from "../controllers/messages.controller.js";
import { productModel } from "./models/product.model.js";
import { userModel } from "./models/user.model.js";
import { ADMIN_EMAIL } from "../config/configs.js";

class ProductManager {
  async addProduct(product) {
    try {
      if (await this.validateCode(product.code)) {
        console.log("Error! Code exists!");
        return false;
      } else {
        const producto = {
          title: product.title,
          description: product.description,
          code: product.code,
          price: product.price,
          status: product.status,
          stock: product.stock,
          category: product.category,
          thumbnail: product.thumbnail,
          owner:product.owner,
        };
        const createdProduct = await productModel.create(producto);
        console.log("Product added!");
        return createdProduct;
      }
    } catch (error) {
      console.error("Error adding product:", error);
      return false;
    }
  }
   //Propiedad utilizada para dar funcionalidad al formulario
   getProductsViews =async ()=>{
    try {
        return await productModel.find().lean();
    } catch (error) {
        return error
    }
  }
  async updateProduct(id, product) {
    try {
      const updatedProduct = await productModel.findByIdAndUpdate(id, product, {
        new: true,
      });
      if (updatedProduct) {
        console.log("Product updated!");
        return true;
      } else {
        console.log("Product not found!");
        return false;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  }

  async deleteProduct(id) {
    try {
        const deletedProduct = await productModel.findByIdAndDelete(id);
        
        const owner = deletedProduct.owner;
        const thisOwner = await userModel.findOne(owner);
        console.log(thisOwner);
        const ownerEmail = thisOwner.email;
        const existProductOwner =  thisOwner;  
        console.log("Product owner", deletedProduct.owner);
        console.log("Datos Owner: ", existProductOwner);
        console.log("Correo del propietario: ", ownerEmail);
       
        if (existProductOwner) {
          console.log("Enviando aviso a owner: ", thisOwner);
          const email = ownerEmail;
  
          const result = transporter.sendMail({
            from: ADMIN_EMAIL,
            to: email,
            subject: `Okuna informa: Tu producto ${deletedProduct.title} a sido borrado`,
            html: `<div style="display: flex; flex-direction: column; justify-content: center;  align-items: center;">
            Hola &nbsp;${thisOwner.first_name}!\nTe informamos que tu producto ${deletedProduct.title} ha sido borrado por la administracion de la pagina.\nSaludos.
            </div>`,
          });
          if (result.status === 'rejected') {
            logger.error(`El correo electrónico a ${email} fue rechazado`);
          }
          
        }
    
        if (deletedProduct) {
            console.log('Producto eliminado correctamente:', deletedProduct);
            return true;
        } else {
            console.log('Producto no encontrado:', id);
            return false;
        }
    } catch (error) {
        console.error('Error eliminando producto:', error);
        return false;
    }
}



  async getProducts(params = {}) {
    let { limit = 10, page = 1, query = {}, sort = {} } = params;
    console.log("Query object:", query, "Type:", typeof query);

    sort = sort ? (sort === "asc" ? { price: 1 } : { price: -1 }) : {};

    try {
      console.log('Received params:', params); 
      console.log('Type of query:', typeof params.query);  
      let products = await productModel.paginate(query, {
        limit: limit,
        page: page,
        sort: sort,
        lean: true,
      });
      let status = products ? "success" : "error";
      let prevLink = products.hasPrevPage
        ? "http://localhost:8080/products?limit=" +
          limit +
          "&page=" +
          products.prevPage
        : null;
      let nextLink = products.hasNextPage
        ? "http://localhost:8080/products?limit=" +
          limit +
          "&page=" +
          products.nextPage
        : null;

      products = {
        status: status,
        payload: products.docs,
        totalPages:products.totalPages,
        prevPage: products.prevPage,
        nextPage: products.nextPage,
        page: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
        prevLink: prevLink,
        nextLink: nextLink,
      };

      console.log(products);
      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        status: "error",
        payload: [],
      };
    }
  }

  async getProductById(id) {
    try {
      return await productModel.findById(id).lean();
    } catch (error) {
      console.error("Error fetching product by id:", error);
      return null;
    }
  }

  async validateCode(code) {
    try {
      return await productModel.exists({ code: code });
    } catch (error) {
      console.error("Error validating code:", error);
      return false;
    }
  }

  async updateProduct(pid, updateData) {
    try {
      const updatedProduct = await productModel.findByIdAndUpdate(pid, updateData, {
        new: true,
      });
      return updatedProduct ? true : false;
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  }
  
}

export default ProductManager;
