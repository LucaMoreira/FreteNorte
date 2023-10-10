<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { getFirestore, doc, collection } from 'firebase/firestore'

import { firebaseApp } from '@/firebaseConfig'
import { computed, reactive, ref, toValue } from 'vue';
import { update_item } from '@/stores/singleitem'
import QRCode from '@/components/QRCode.vue';
import { useDocument, useCollection } from 'vuefire';
import ModalDelete from '@/components/ModalDelete.vue'; 
import { deleta_item } from '@/stores/items'
import Vue3Barcode from 'vue3-barcode'

const db = getFirestore(firebaseApp)
const route = useRoute()
const router = useRouter()
const {
    // rename the Ref to something more meaningful
    data: item,
    // is the subscription still pending?
    pending,
    // did the subscription fail?
    error: errorRef,
    // A promise that resolves or rejects when the initial state is loaded
    promise
} = useDocument(doc(db, 'items', route.params.codigo))

// pega todos os ambientes cadastrados
const ambientes = useCollection(collection(db, 'ambientes'))

const validacao = reactive({
    medidas: true,
    peso: true
})

function reseta_validacao(){ 
    validacao.medidas = true
    validacao.peso = true
}

function validar(){
    const medidas_regex = /\d+\s*[xX]\s*\d+\s*[xX]\s*\d+/g
    const test_medidas1 =  medidas_regex.test(item.value.detalhes.medidas) 
    const test_medidas2 =  item.value.detalhes.medidas == ''
    validacao.medidas =  test_medidas1 || test_medidas2

    const peso_regex = /\d+/g
    const test_peso1 =  peso_regex.test(item.value.detalhes.peso)
    const test_peso2 =  item.value.detalhes.peso == ''
    validacao.peso = test_peso1 || test_peso2
    return validacao.medidas && validacao.peso
}

async function atualiza_item() {
    if(!validar()) {
        console.log("Erro de validação")
        setTimeout(reseta_validacao, 2500)
        return false
    } else {
    const valores = toValue(item)
    var ca = ''
    if (valores.ambiente.codigo == undefined) {
        // ambiente foi atualizado
        ca = valores.ambiente
    } else {
        // ambiente nao foi atualizado
        ca = valores.ambiente.codigo
    }
    console.log({...valores.detalhes})
    const uptime = await update_item(valores.key, {
        "detalhes.medidas": valores.detalhes.medidas,
        "detalhes.peso"   : valores.detalhes.peso,
        "ambiente"        : doc(db, "ambientes", ca)
    })  

    console.log(`Item ${valores.key} atualizado`)
    }
}

const isParte = computed(() => item.value?.tipo == "Parte")
const parentKey = computed( () => isParte.value? item.value.key.split('-')[0] : null )

async function front_apaga_volume() {
    if(item.value.categoria != 'Permanente') {
        const ambiente_route =  item.value.ambiente.codigo
        const resultado = await deleta_item(item.value.key)
        console.log(resultado)
        setTimeout( () => router.push({name: 'items-ambiente', params: { ambiente: ambiente_route}}), 250)
        return true
    } else {
        return false
    }
}

function marcar_como_perdido(){
    const valores = toValue(item)
    const uptime = update_item(valores.key, {
        "ambiente": doc(db, "ambientes", "PERDIDO")
    })
    console.log(`Item ${valores.key} marcado como perdido`)
}

function desmarcar_como_perdido(){
    const valores = toValue(item)
    const uptime = update_item(valores.key, {
        "ambiente": doc(db, "ambientes", valores.origem)
    })
    console.log(`Item ${valores.key} encontrado`)

}

function marcar_como_infra(){
    const valores = toValue(item)
    const uptime = update_item(valores.key, {
        "ambiente": doc(db, "ambientes", "INFRA")
    })
    console.log(`Item ${valores.key} marcado como infraestrutura`)
}

function desmarcar_como_infra(){
    const valores = toValue(item)
    const uptime = update_item(valores.key, {
        "ambiente": doc(db, "ambientes", valores.origem)
    })
    console.log(`Item ${valores.key} desmarcado como infraestrutura`)
}
</script>

<template>
    
    <Suspense>
        <template v-if="pending">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </template>
        <template v-else>
            <template v-if="item">
                <h4 class="d-none d-print-block">Sistema Frete Norte</h4>
                <div class="row align-items-start">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center">

                        <h4 class="mb-1 ">
                            {{ item.short_descricao }}
                        <span class="mt-1 badge text-secondary">{{ item.key }}</span> 
                        </h4>
                            
                        </div>
                        <p class="text-secondary p-2">
                            {{ item.detalhes.descricao }}
                        </p>
                        <table class="table d-print-none">
                            <tbody>
                                <tr v-if="isParte">
                                    <th scope="row">Item pai</th>
                                    <td><RouterLink :to="{name: 'item-codigo', params: {codigo: parentKey}}">Ver item</RouterLink></td>
                                </tr>
                                <tr>
                                    <th scope="row">Origem</th>
                                    <td>{{ item.origem }}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Ambiente</th>
                                    <td >
                                        <select class="form-select input-group  w-50" v-model.trim="item.ambiente">
                                            <option selected>{{ item.ambiente.codigo }}</option>
                                            <option v-for="ambiente in ambientes">{{ ambiente.codigo }}</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr v-if="item.detalhes.patrimonio">
                                    <th scope="row">Patrimônio</th>
                                    <td>{{ item.detalhes.patrimonio }}</td>
                                </tr>

                                <tr v-if="item.detalhes.cod_barras">
                                    <th scope="row">Código de barras</th>
                                    <td>{{ item.detalhes.cod_barras }}</td>
                                </tr>
                                <tr v-if="item.detalhes.valor > 0">
                                    <th scope="row">Valor</th>
                                    <td>R$ {{ item.detalhes.valor.toFixed(2) }}</td>
                                </tr>

                                <tr>
                                    <th scope="row">Medidas</th>
                                    <td>
                                        <div class="input-group  w-50" >
                                        <input :class="{'border-danger': !validacao.medidas}" placeholder="L x A x P em centímetros"
                                        class="form-control" v-model.trim="item.detalhes.medidas">
                                        <span class="input-group-text">cm</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <th scope="row">Peso</th>
                                    <td>
                                        <div class="input-group  w-50">
                                        <input  :class="{'border-danger': !validacao.peso}" class="form-control" v-model.trim="item.detalhes.peso">
                                        <span class="input-group-text">kg</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Volume</th>
                                    <td>
                                        <template v-if="item.meta.volume">
                                        <RouterLink class="icon-link" :to="{name: 'volume-codigo', params: {codigo: item.meta.volume.codigo }}">
                                            <i class="bi bi-link-45deg"></i> {{ item.meta.volume.codigo }}</RouterLink> 
                                        </template>
                                        <template v-else>
                                            Item não volumado. <RouterLink v-if="item.meta.inteiro" class="btn btn-success" :to="{name: 'volume-add', query: {
                                                ambiente: item.ambiente.codigo,
                                                items: [item.key]
                                            }}">Criar volume <i class=" icon-link bi bi-box"></i></RouterLink>
                                        </template>
                                    </td>
                                </tr> 
                                <tr v-if="item.tipo != 'Parte'">
                                    <th scope="row">Partes</th>
                                    <td><template v-if="item.tipo == 'Permanente' && !item.meta.volumado">
                                        <ul class="list-group w-50">
                                        <li class="list-group-item" v-for="parte in item.meta.partes">
                                            <RouterLink :to="{name: 'item-codigo', params: {codigo: parte.key}}"><i class="bi bi-link-45deg"></i></RouterLink>
                                            {{ parte.detalhes?.descricao }}</li>
                                        </ul>

                                        <RouterLink :to="{ name: 'item-codigo-partes', params: { codigo: item.key } }"
                                            class="">Editar partes</RouterLink>
                                        </template>
                                        <template v-else>
                                            <template v-if="item.meta.volumado">
                                                <span class="text-secondary">Um item já volumado não pode ser dividido em partes.</span>
                                            </template>
                                            <template v-else>
                                                <span class="text-secondary">Esse item não pode ser divido.</span>
                                            </template>
                                        </template>
                                    </td>

                                </tr>

                                <tr class="border-primary">
                                    <td>
                                    </td>
                                    <td class="text-end d-print-none justify-content-between"> 

                                        <button v-if="item.tipo != 'Permanente'" class="btn btn-danger mx-3" data-bs-target="#deletar" data-bs-toggle="modal" >Deletar</button>
                                        <button class="btn btn-primary" @click="atualiza_item">Salvar</button>
                                    </td>
                                </tr>
                                <template v-if="item.tipo == 'Permanente'">
                                <tr>
                                    <template v-if="item.ambiente.codigo != 'PERDIDO' &&  item.ambiente.codigo != 'INFRA'">
                                    <td class="text-end">
                                        <i class="bi bi-question-octagon text-warning-emphasis"></i>
                                    </td>
                                    <td colspan="1">
                                        Não encontrou esse item? Clique aqui para <a href="#" @click="marcar_como_perdido">marcar item como perdido</a>.
                                    </td>
                                    </template>
                                    <template v-if="item.ambiente.codigo == 'PERDIDO' ">
                                    <td colspan="2" class="text-light fs-4 text-center bg-danger">
                                        Esse item está marcado como perdido
                                        <p @click="desmarcar_como_perdido" class="fs-6 mb-0 text-primary-emphasis" role="button">Clique aqui para desmarcar esse item como perdido</p>
                                    </td>
                                    </template>
                                </tr>
                                </template>
                                <tr>
                                    <template v-if="item.ambiente.codigo != 'INFRA' && item.ambiente.codigo != 'PERDIDO'">
                                    <td class="text-end">
                                        <i class="bi bi-building-gear"></i>
                                    </td>
                                    <td colspan="1">
                                        Clique aqui para <a href="#" @click="marcar_como_infra">marcar item como infraestrutura</a>. Nesse caso, outra pessoa ficará responsável por esse item.
                                    </td>
                                    </template>
                                    <template v-if="item.ambiente.codigo == 'INFRA' ">
                                    <td colspan="2" class="text-light fs-4 text-center bg-info">
                                        Esse item é um item de infraestrutura
                                         <p @click="desmarcar_como_infra" class="fs-6 mb-0 text-primary" role="button">Clique aqui para desmarcar esse item como infraestrutura</p>
                                    </td>
                                    </template>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
                <div class="row">
                    <div class="col-auto">
                        <QRCode :path="route.fullPath"></QRCode>
                    </div>
                    <div class="col">
                        <h5>{{ item.short_descricao }}</h5> 
                        <p v-if="item.detalhes.cod_barras" class="float-end text-end"> 
                            <Vue3Barcode format="CODE39" :value="item.detalhes.cod_barras" height="40" width="2" ></Vue3Barcode>
                        </p> 
                        <p class="mb-1">
                            <small>
                                <b>{{ item.ambiente.codigo }}</b> - <span class="">{{ item.ambiente.nome }}</span>
                            </small>
                        </p> 
                        <p  v-if="item.tipo == 'Permanente'">Patrimoniado em nome de {{ item.responsavel }}</p>
                        <p v-if="item.tipo == 'Parte'">Parte registrada por {{ item.responsavel }}</p>
                        <p v-if="item.tipo == 'Consumível'">Item registrado por {{ item.responsavel }}</p>
                    </div> 

                </div>

    <ModalDelete id="deletar"  :delete_callback="async () => await front_apaga_volume()">
        <template #titulo>
            Apagar item
        </template>
        <template #corpo>
            Certeza que quer apagar o item {{item.short_descricao}}?
        </template>
    </ModalDelete>
            </template>
            <div v-else class="alert alert-danger">
                <p>O item pesquisado não existe.</p>
                <RouterLink class="icon-link" :to="{ name: 'items' }"><i class="bi bi-arrow-left"></i> Voltar</RouterLink>
            </div>
        </template>
    </Suspense>

</template>
