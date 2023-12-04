import { openDB } from "idb";

let db;
async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('Pizzaria', {
                            keyPath: 'titulo'
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btnCadastro').addEventListener('click', adicionarPizzaria);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasPizzas);
});

async function buscarTodasPizzas(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('Pizzaria', 'readonly');
    const store = await tx.objectStore('Pizzaria');
    const Pizzas = await store.getAll();
    if(Pizzas){
        const divLista = Pizzas.map(Pizzaria => {
            return `<div class="item">
                    <p>Pizzaria</p>
                    <p>Nome:${Pizzaria.titulo} </p>
                    <p>Descrição:${Pizzaria.descricao}</p>
                    <p>numero de pizzas no cardapio:${Pizzaria.pizza}</p>
                    <p>Latitude:${Pizzaria.latitude}</p>
                    <p>Longitude:${Pizzaria.longitude}</p>
                    <div class="mapouter">
                    <div class="gmap_canvas">
                        <iframe width="600" height="500" id="gmap_canvas_${Pizzaria.titulo}" 
                            src="https://maps.google.com/maps?q=${Pizzaria.latitude}%2C${Pizzaria.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                            frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
                        <a href="https://123movies-i.net"></a>
                        <br>
                        <style>.mapouter{position:relative;text-align:right;height:500px;width:600px;}</style>
                        <a href="https://www.embedgooglemap.net">google maps embed</a>
                        <style>.gmap_canvas{overflow:hidden;background:none!important;height:500px;width:600px;}</style>
                    </div>
                </div>
               </div>`;
        });
        listagem(divLista.join(' '));
    }
    document.querySelectorAll('.btnMostrarMapa').forEach(button => {
        button.addEventListener('click', mostrarMapa);
    });
}

function mostrarMapa(event) {
    const latitude = event.target.getAttribute('data-latitude');
    const longitude = event.target.getAttribute('data-longitude');
    const titulo = event.target.parentElement.querySelector('p:nth-child(2)').innerText.split(' ')[1]; // obtém o nome da pizzaria

    if (latitude && longitude) {
        const mapaDiv = event.target.parentElement.querySelector('.mapouter');

        // Atualiza o iframe com as novas coordenadas
        mapaDiv.innerHTML = `<div class="gmap_canvas">
                                <iframe width="600" height="500" id="gmap_canvas_${titulo}" 
                                    src="https://maps.google.com/maps?q=${latitude}%2C${longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed" 
                                    frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
                                <a href="https://123movies-i.net"></a>
                                <br>
                                <style>.mapouter{position:relative;text-align:right;height:500px;width:600px;}</style>
                                <a href="https://www.embedgooglemap.net">google maps embed</a>
                                <style>.gmap_canvas{overflow:hidden;background:none!important;height:500px;width:600px;}</style>
                            </div>`;
    }
}

async function adicionarPizzaria() {
    let titulo = document.getElementById("titulo").value;
    let descricao = document.getElementById("descricao").value;
    let pizza = document.getElementById("pizza").value;
    let latitude = document.getElementById("latitude").value;
    let longitude = document.getElementById("longitude").value;
    let data = document.getElementById("data").value;
    const tx = await db.transaction('Pizzaria', 'readwrite')
    const store = tx.objectStore('Pizzaria');
    try {
        await store.add({ titulo: titulo, descricao: descricao, pizza: pizza, latitude: latitude, longitude: longitude, data: data });
        await tx.done;
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}

