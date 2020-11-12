import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import Search from '../components/Search';
import Categories from '../components/Categories';
import Carousel from '../components/Carousel';
import CarouselItem from '../components/CarouselItem';
import '../assets/styles/App.scss';

const Home = ({ myList, trends, originals, filter }) => {
  const myListFiltered = myList.filter(
    (item) => item.title.toLowerCase().includes(filter.toLowerCase()), // eslint-disable
  );
  const trendsFiltered = trends.filter(
    (item) => item.title.toLowerCase().includes(filter.toLowerCase()), // eslint-disable
  );
  const originalsFiltered = originals.filter(
    (item) => item.title.toLowerCase().includes(filter.toLowerCase()), // eslint-disable
  );
  return (
    <>
      <Header />
      <Search isHome />
      {myListFiltered.length > 0 && (
        <Categories title='Mi Lista'>
          <Carousel>
            {myListFiltered.map((item) => (
              // eslint-disable-next-line
              <CarouselItem key={item.id} {...item} isList />
            ))}
          </Carousel>
        </Categories>
      )}
      {trendsFiltered.length > 0 && (
        <Categories title='Tendencias'>
          <Carousel>
            {trendsFiltered.map((item) => (
              // eslint-disable-next-line
              <CarouselItem key={item.id} {...item} />
            ))}
          </Carousel>
        </Categories>
      )}
      {originalsFiltered.length > 0 && (
        <Categories title='Originales de Platzi Videos'>
          <Carousel>
            {originalsFiltered.map((item) => (
              // eslint-disable-next-line
              <CarouselItem key={item.id} {...item} />
            ))}
          </Carousel>
        </Categories>
      )}
    </>
  );
};

Home.propTypes = {
  myList: PropTypes.array,
  trends: PropTypes.array,
  originals: PropTypes.array,
  filter: PropTypes.string,
};

const mapStateToProps = (state) => {
  return {
    myList: state.myList,
    trends: state.trends,
    originals: state.originals,
    filter: state.filter,
  };
};

export default connect(mapStateToProps, null)(Home);
