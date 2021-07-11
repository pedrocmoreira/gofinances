import React, { useState } from 'react';
import {
    Keyboard,
    Modal,
    TouchableWithoutFeedback,
    Alert
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useForm } from 'react-hook-form';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native'
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';


import { Button } from '../../components/Form/Button';
import { InputForm } from '../../components/Form/InputForm';

import {
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionsTypes
} from './styles';

import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';
import { CategorySelect } from '../CategorySelect';
import { useAuth } from '../../Hooks/Auth';



interface FormData {
    name: string;
    amount: string;
    //Usar os mesmos nome do form
}

//schema para configuração do yup, para validação
const schema = Yup.object().shape({
    name: Yup.string().required("O nome é obrigatório"),
    amount: Yup.number().typeError("Informe um valor númerico")
        .positive("O valor não pode ser negativo")
        .required("O valor é obrigatório")
});

export function Register() {
    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    
    const { user } = useAuth();

    const [category, setCategory] = useState({
        key: 'category',
        name: 'Categoria',
    });

    const Navigation = useNavigation();

    const {
        control, //reguistrar os uinputs no form
        handleSubmit,
        reset,
        formState: { errors } //Pega os valores do form e envia uma unica vez
    } = useForm({
        resolver: yupResolver(schema)
    });


    function handleTransactionTypeSelect(type: 'positive' | 'negative') {
        setTransactionType(type);
    }

    function handleOpenSelectCategoryModal() {
        setCategoryModalOpen(true);
    }

    function handleCloseSelectCategoryModal() {
        setCategoryModalOpen(false);
    }

    async function handleRegister(form: FormData) {
        if (!transactionType)
            return Alert.alert("Selecione o tipo da transação");
        
        if(category.key === "category")
            return Alert.alert("Selecione a categoria");

            const newTransaction = {
                id: String(uuid.v4()), //O v4 retorna uma hash
                name: form.name,
                amount: form.amount,
                type: transactionType,
                category: category.key,
                date: new Date()
            }

        try{
            const dataKey = `@gofinances:transactions_user:${user.id}`
            const data = await AsyncStorage.getItem(dataKey); //Pegando os valores que já estão salvos
            const currentData = data ? JSON.parse(data) : [];//vejo se já tenho alguma coisa nesse storage

            const dataFormatted = [
                //Aqui pego a transação antiga e adiciono a nova transação
                ...currentData,
                newTransaction
            ]

            await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));
            
            //Setando para o estado inicial os campos de cadastro 
            reset();
            setTransactionType('');
            setCategory({
                key: "category",
                name: "Categoria"
            });

            Navigation.navigate("Listagem");

        } catch (error) {
            console.log(error);
            Alert.alert("Não foi possível salvar");
        }
    }

    //Use effect será utilizado na listagem 
    // useEffect(() => {
    //     async function loadData(){
    //        const data =  await AsyncStorage.getItem(dataKey);
    //        console.log(JSON.parse(data!)); //Exclamação diz que sempre vai ter algo nesse objeto
    //     }
    //     loadData();
    //     //Limpando uma coleção
    //     // async function removeAll(){
    //     //     await AsyncStorage.removeItem(dataKey);
    //     // }

    //     // removeAll();
    // }, []);


    

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>
                <Header>
                    <Title>Cadastro</Title>
                </Header>

                <Form>
                    <Fields>
                        <InputForm
                            name="name"
                            control={control}
                            placeholder="Nome"
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            error={errors.name && errors.name.message}
                        />

                        <InputForm
                            name="amount"
                            control={control}
                            placeholder="Preço"
                            keyboardType="numeric"
                            error={errors.amount && errors.amount.message}
                        />
                        <TransactionsTypes>
                            <TransactionTypeButton
                                type="up"
                                title="Entrada"
                                onPress={() => handleTransactionTypeSelect('positive')}
                                isActive={transactionType === 'positive'}
                            />
                            <TransactionTypeButton
                                type='down'
                                title="Saída"
                                onPress={() => handleTransactionTypeSelect('negative')}
                                isActive={transactionType === 'negative'}
                            />
                        </TransactionsTypes>
                        <CategorySelectButton
                            title={category.name}
                            onPress={handleOpenSelectCategoryModal}
                        />
                    </Fields>
                    <Button
                        title="Enviar"
                        onPress={handleSubmit(handleRegister)}
                    />
                </Form>
                <Modal visible={categoryModalOpen}>
                    <CategorySelect
                        category={category}
                        setCategory={setCategory}
                        closeSelectCategory={handleCloseSelectCategoryModal}
                    />
                </Modal>
            </Container>
        </TouchableWithoutFeedback>
    )
}