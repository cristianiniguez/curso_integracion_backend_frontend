import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setFilter } from '../actions';
import '../assets/styles/components/Search.scss';

const Search = ({ isHome }) => {
  const inputStyle = classNames('input', {
    isHome,
  });
  const handleSearch = (event) => {
    props.setFilter(event.target.value);
  };
  return (
    <section className='main'>
      <h2 className='main__title'>¿Qué quieres ver hoy?</h2>
      <input type='text' className={inputStyle} placeholder='Buscar...' onChange={handleSearch} />
    </section>
  );
};

Search.propTypes = {
  isHome: PropTypes.bool,
};

const mapDispatchToProps = {
  setFilter,
};

export default connect(null, mapDispatchToProps)(Search);
