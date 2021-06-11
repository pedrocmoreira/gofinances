import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { RFValue } from 'react-native-responsive-fontsize';

import { useTheme } from 'styled-components';

import { HistoryCard } from '../../components/HistoryCard';

import {
    Container,
    Header,
    Title,
    Content,
    ChartContainer
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
    total: number;
    totalFormatted: string;
    color: string;
    percent: string;
}

export function Resume() {
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);
    const theme = useTheme();

    async function loadData() {
        const dataKey = '@gofinances:transactions';
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];

        const expensives = responseFormatted
            .filter((expensive: TransactionData) => expensive.type === 'negative');

        const expensiveTotal = expensives
            .reduce((accumulator: number, expensive: TransactionData) => {
                return accumulator + Number(expensive.amount);
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
                const totalFormatted = categorySum
                    .toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    });

                //Faço a conta de porcentagem e mostro essa porcentagem arredondada com o tofixed
                const percent = `${(categorySum / expensiveTotal * 100).toFixed(0)}%`;


                totalBycategory.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    total: categorySum,
                    totalFormatted,
                    percent
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
                <ChartContainer>
                    <VictoryPie
                        data={totalByCategories}
                        colorScale={totalByCategories.map(category => category.color)}
                        style={{
                            labels: { 
                                fontSize: RFValue(18),
                                fontWeight: 'bold',
                                fill: theme.colors.shape, 
                            }
                        }}
                        labelRadius={55}
                        x="percent"
                        y="total"
                    />
                </ChartContainer>

                {
                    totalByCategories.map(item => (
                        <HistoryCard
                            //Como são poucos items não é preciso utilizar uma Flatlist
                            key={item.key}
                            title={item.name}
                            amount={item.totalFormatted}
                            color={item.color}
                        />
                    ))
                }
            </Content>
        </Container>
    );
}