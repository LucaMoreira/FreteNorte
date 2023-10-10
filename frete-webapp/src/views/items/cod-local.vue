<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { db } from '@/backend'
import { ref, toValue } from 'vue';
import { useDocument } from 'vuefire';
import { doc, updateDoc } from 'firebase/firestore';
import SelectPlus from '@/components/SelectPlus.vue'
import { update } from 'firebase/database';

const route = useRoute()
const router = useRouter()
const {
    // rename the Ref to something more meaningful
    data: item,
    // is the subscription still pending?
    pendingItem,
    // did the subscription fail?
    error: errorRefItem,
    // A promise that resolves or rejects when the initial state is loaded
    promiseItem
} = useDocument(doc(db, 'items', route.params.codigo))

const {
    // rename the Ref to something more meaningful
    data: ambientes_sul,
    // is the subscription still pending?
    pendingAmbientes,
    // did the subscription fail?
    error: errorRef,
    // A promise that resolves or rejects when the initial state is loaded
    promiseAmbientes
} = useDocument(doc(db, 'agregados', 'ambientes'))


const novo_ambiente = ref("")

async function salvar() {
    console.log(toValue(novo_ambiente))
    if (novo_ambiente.value != "") {
        const newAmbienteRef = doc(db, "ambientes", novo_ambiente.value)
        const itemRef = doc(db, "items", route.params.codigo)
        await updateDoc(itemRef, {
            ambiente: newAmbienteRef
        })
        router.push({ name: 'item-codigo', params: { codigo: route.params.codigo } })
    }
}
</script>

<template>
    <div v-if="!pendingItem" class="row align-items-start">
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
        </div>
    </div>
    <table class="table d-print-none">
        <thead>
            <td class="w-25"></td>
            <td></td>
        </thead>
        <tbody>
            <tr>
                <th scope="row">Origem</th>
                <td>{{ item.origem }}</td>
            </tr>
            <tr v-if="item.detalhes.patrimonio">
                <th scope="row">Patrimônio</th>
                <td>{{ item.detalhes.patrimonio }}</td>
            </tr>

            <tr v-if="item.detalhes.cod_barras">
                <th scope="row">Código de barras</th>
                <td>{{ item.detalhes.cod_barras }}</td>
            </tr>
            <tr>
                <th scope="row">Localização</th>
                <td>
                    {{ item.ambiente.codigo }} - {{ item.ambiente.nome }}
                </td>
            </tr>
        </tbody>
    </table>
    <div class="row mt-4 align-items-center">
        <div class="col-4">
            Encontrei esse item no seguinte ambiente:
        </div>
        <div class="col-8">
            <template v-if="!pendingAmbientes">
                <SelectPlus @selected="x => novo_ambiente = x" placeholder="Digite o código do ambiente para pesquisar"
                    name="ambiente" :options="ambientes_sul.codigos" :valor="novo_ambiente"></SelectPlus>
            </template>
        </div>
        <div class="col-6">
            <RouterLink :to="{ name: 'item-codigo', params: { codigo: route.params.codigo } }"
                class="mt-4">Ver item</RouterLink>
        </div>
        <div class="col-6 text-end"> 
            <button :class="novo_ambiente == '' ? 'btn-secondary' : 'btn-primary'" class="btn mt-4"
                @click="salvar">Salvar</button>
        </div>
    </div>
</template>