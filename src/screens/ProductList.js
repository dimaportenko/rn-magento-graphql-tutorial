import React, {useEffect, useState} from 'react';
import {Text, View, FlatList, StyleSheet, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getProducts} from '../api';
import {Product} from '../models/Product';
import ProductListItem from '../components/ProductListItem';
import {useQuery} from '@apollo/react-hooks';
import {gql} from 'apollo-boost';

const GET_PRODUCTS = gql`
    query getProducts($categoryId: String) 
    {
    products(pageSize: 10, currentPage: 1, filter: {category_id: {eq: $categoryId}}) {
      total_count
      items {
        id
        name
        image {
          url
        }
        price_range {
          minimum_price {
            final_price {
              value
              currency
            }
          }
        }
        description {
          html
        }
      }
    }
  }
`;

export default () => {
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();
  const {loading, error, data} = useQuery(GET_PRODUCTS, {
    variables: { categoryId: "13" }
  });

  useEffect(() => {
    if (data) {
      const _products = data.products?.items.map(item => ({
        key: item.id,
        name: item.name,
        price: item.price_range?.minimum_price?.final_price?.value,
        image: item.image?.url,
        description: item.description?.html,
      }));

      setProducts(_products || []);
    }
  }, [data]);

  const onListItemPress = product => {
    navigation.navigate('Product', {product});
  };

  const renderItem = ({item}: {item: Product}) => (
    <ProductListItem key={item.key} item={item} onPress={onListItemPress} />
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={(product, index) => `${product.key}${index}`}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => {}} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
