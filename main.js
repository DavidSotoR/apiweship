const express = require('express');
const axios = require('axios');
const CORS = require('cors');
const app = express();
const port = 4000;
const hostAPI = 'https://track.weship.com'

app.use(CORS({
    origin: 'http://localhost:3000', // Permitir solicitudes solo desde este origen
    methods: ['GET', 'POST'], // Permitir solo los métodos GET y POST
  }))
app.use(express.json());

app.get('/api/v1/shipment/list', async (req, res) => {
    console.log('get list');
    var token = req.headers.weship
    var query = req.headers.query
    var rowsList = await getListShipments(query, token)
    res.json(rowsList)
});

app.post('/api/v1/shipment/tracking-number', async (req,res)=>{
    var datosPOST = req.body
    var token = req.headers.weship
    var shipments ={
        shipments: [
            {
                courier: datosPOST.courier,
                tracking: datosPOST.tracking
            }
        ]
    }
    var details = await getDetailsTrackingNumber(shipments,token)
    res.json(details)
})

app.post('/api/login',async (req, res)=>{
    console.log('ejecutanto login');
    var credencial = req.body
    var weship
    try {
        weship = await loginToWeShips(credencial)
        TOKEN = weship.token
    } catch (error) {
        weship = error

    }
    
    console.log(weship)
    res.json(weship)
})

app.listen(port, () => {
  console.log(`La aplicación está escuchando en http://localhost:${port}`);
});

async function loginToWeShips(dataLogin) {
    try {
        var resp = await axios.post(hostAPI+'/api/v1/auth/login',dataLogin)
        const estatus = resp.data.success;
        const accessToken = resp.data.accessToken;
        TOKEN = accessToken
        var respuesta = {
           success : estatus,
           token: accessToken
        }
        return respuesta
    } catch (error) {
        const estatus = error.response.data.code;
        const accessToken = error.response.data.message;
        var respuestaError = {
           success : estatus,
           token: accessToken
        }
        return respuestaError
    }
    
}

async function getListShipments(query, token) {
    var url =`https://track.weship.com/api/v1/shipment/list${query != '' ? '?'+query : ''}`
    var config = {
        headers:{
            Authorization: 'Bearer '+token,
            "Weship-API-Version": '1.0'
        }
    }
    try {
        var result = await axios.get(url,config)
        var resCount = result.data.count
        var resRows = result.data.rows ?? []
        var respuesta = {
            count: resCount,
            rows: resRows
        }
        return respuesta
            
    } catch (error) {
        return error
    }
}

async function getDetailsTrackingNumber(shipment,token) {
    var url ='https://track.weship.com/api/v1/tracking/getStatus'
    var config = {
        headers:{
            Authorization: 'Bearer '+token,
            "Content-Type": 'application/json', 
            "Weship-API-Version": '1.0'
        }
    }
    try {
        var result = await axios.post(url,shipment,config)
        var resultShipment = {
            success: result.data.success,
            data: result.data.data
        }
        return resultShipment
    } catch (error) {
        return error
    }
}

