import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryCard } from '../../components/HistoryCard';

import {
    Container,
    Header,
    Title,
    Content,
} from './styles';
import { categories } from '../../utils/categories';

interface TransactionData {
    type: 'positive' | 'negative';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData {
    key: string;
    name: string;
    total: string;
    color: string;
    percentFormatted: string;
    percent: number;
}

export function Resume() {
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

    async function loadData() {
        const dataKey = '@gofinances:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];

        const expensives = responseFormatted
            .filter((expensive: TransactionData) => expensive.type === 'negative');

        const expensivesTotal = expensives
            .reduce((accumulator: number, item: TransactionData) => {
                return accumulator + Number(expensives.amount);
            }, 0);

        const totalBycategory: CategoryData[] = [];

        //Foreach para não devolver um objeto, diferente do map
        categories.forEach(category => {
            let categorySum = 0;

            expensives.forEach((expensive: TransactionData) => {
                if (expensive.category === category.key) {
                    categorySum += Number(expensive.amount);
                }

            });

            if (categorySum > 0) {
                const total = categorySum
                    .toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                });
                
                //Faço a conta de porcentagem e mostro essa porcentagem arredondada com o tofixed
                const percent = (categorySum / expensivesTotal * 100);
                const percentFormatted = `${percent.toFixed(0)}%`;


                totalBycategory.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    total,
                    percent,
                    percentFormatted
                });
            }
        });

        setTotalByCategories(totalBycategory);

    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <Container>
            <Header>
                <Title>Resumo por categoria</Title>
            </Header>
            <Content>
                {
                    totalByCategories.map(item => (
                        <HistoryCard
                            //Como são poucos items não é preciso utilizar uma Flatlist
                            key={item.key}
                            title={item.name}
                            amount={item.total}
                            color={item.color}
                        />
                    ))
                }
            </Content>
        </Container>
    );
}