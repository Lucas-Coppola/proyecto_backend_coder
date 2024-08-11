// const chai = require('chai');
// const { describe, it } = require('mocha');
// const supertest = require('supertest');
import * as chai from 'chai';
import { describe, it } from 'mocha';
import supertest from 'supertest';

const expect = chai.expect
const requester = supertest('http://localhost:8080');

describe('Test de ecommerce', () => {

    describe('Test de productos', () => {
        it('El endpoint GET /api/products debe devolver todos los productos correctamente', async () => {
            const {
                statusCode,
                ok
            } = await requester.get('/api/products');

            expect(ok).to.be.equal(true);
            expect(statusCode).to.be.equal(200);
        });

        it('El endpoint GET /api/products/:pid debe devolver un producto correctamente', async () => {
            const pid = '66352e8df3987313c37d9792'

            const {
                _body,
                statusCode,
                ok
            } = await requester.get(`/api/products/${pid}`);

            // expect(ok).to.be.eql(true);
            // expect(statusCode).to.be.eql(200);
            expect(_body).to.have.property('_id');
        });

        it('El endpoint POST /api/products debe crear un producto correctamente', async () => {
            const nuevoProducto = {
                title: 'Producto 20',
                descripcion: 'gran producto',
                precio: 1275,
                img: '/img',
                code: 'ABC888',
                stock: 4,
                category: 'consola'
            }

            const { _body } = await requester.post('/api/products').send(nuevoProducto);

            expect(_body.payload).to.have.property('_id');
        });        
    });

    describe('Test de carritos', () => {

        it('El endpoint GET /api/carts debe devolver todos los carritos correctamente', async () => {
            const {
                statusCode,
                ok,
                // _body
            } = await requester.get('/api/carts');

            // console.log(_body);

            expect(ok).to.be.equal(true);
            expect(statusCode).to.be.equal(200);
        });

        it('El endpoint GET /api/carts/:cid debe devolver un carrito correctamente', async () => {
            const cid = '66415384d58d0d8b7e91820a'

            const {
                _body,
                ok
            } = await requester.get(`/api/carts/${cid}`);

            // console.log(_body);
            // console.log(ok);

            expect(ok).to.be.eql(true);
            expect(_body).to.have.property('_id');
        });

        it('El endpoint POST /api/carts debe crear un carrito correctamente', async () => {
            const newCart = {
                products: []
            }

            const { _body } = await requester.post('/api/carts').send(newCart);

            // console.log(_body);

            expect(_body.payload).to.have.property('_id');
        });

    });

    describe('Test de sessions', () => {
        it('El endpoint /api/sessions/register debe crear el usuario correctamente', async () => {
            const newUser = { 
                first_name: 'Jorge',
                last_name: 'Rodriguez',
                email: 'jorgito@gmail.com',
                age: new Date('1995-03-04'),
                password: '1234'
            }

            const { headers } = await requester.post('/api/sessions/register').send(newUser);

            expect(headers.location).to.be.eql('http://localhost:8080/products');
        });


        it('El endpoint /api/sessions/login debe loguear el usuario correctamente', async () => {
            const loggedUser = {
                email: 'jorgito@gmail.com',
                password: '1234'
            }

            const { headers } = await requester.post('/api/sessions/login').send(loggedUser);

            expect(headers.location).to.be.eql('http://localhost:8080/products');
        });

        it('El endpoint /api/sessions/recoverPasswordByEmail debe enviar un mail de recuperación al email seleccionado', async () => {
            const email = {
                email: 'coppolalucascai@gmail.com'
            }

            const { status } = await requester.post('/api/sessions/recoverPasswordByEmail').send(email);

            // console.log(status);

            expect(status).to.be.eql(200);
        });
    });

});