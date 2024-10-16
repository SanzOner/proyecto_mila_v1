import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import BarraAdmin from '../../barras/BarraAdministrador';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import logoImage from '../eventos/logo-empresa-mila.png';

Font.register({
  family: 'Arial',
  src: 'https://fonts.gstatic.com/s/arial/v14/jizuRxTKPFOPANOYFxP3XQ.ttf'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 30,
    fontFamily: 'Arial',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
  },
});

// reporte indivial pdf
const EventoPDF = ({ evento }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image style={styles.logo} src={logoImage} />
      <View style={styles.section}>
        <Text style={styles.title}>{evento.nombre}</Text>
        <Text style={styles.text}>Categoría: {evento.categoria}</Text>
        <Text style={styles.text}>Fecha: {new Date(evento.fecha).toLocaleDateString()}</Text>
        <Text style={styles.text}>Estado: {evento.estadoEvento}</Text>
        <Text style={styles.text}>Cupos Disponibles: {evento.cantidadCupos}</Text>
        <Text style={styles.text}>Descripción: {evento.descripcion}</Text>
      </View>
      <Text style={styles.footer}>Reporte generado el {new Date().toLocaleString()}</Text>
    </Page>
  </Document>
);

// reporte general de todos los evenos pdf
const TodosEventosPDF = ({ eventos }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image style={styles.logo} src={logoImage} />
      <View style={styles.section}>
        <Text style={styles.title}>Reporte de Todos los Eventos</Text>
        {eventos.map((evento, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text style={styles.text}>Nombre: {evento.nombre}</Text>
            <Text style={styles.text}>Categoría: {evento.categoria}</Text>
            <Text style={styles.text}>Fecha: {new Date(evento.fecha).toLocaleDateString()}</Text>
            <Text style={styles.text}>Estado: {evento.estadoEvento}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>Reporte generado el {new Date().toLocaleString()}</Text>
    </Page>
  </Document>
);

const RegistroEventosAdmin = () => {
  const [eventos, setEventos] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('asc');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [eventosNoEncontrados, setEventosNoEncontrados] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/eventos')
      .then(respuesta => {
        setEventos(respuesta.data);
        setEventosNoEncontrados(false);
      })
      .catch(error => {
        console.error('Error al cargar eventos:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar los eventos.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  }, []);

  const eventosFiltrados = eventos
    .filter(evento => {
      const coincideCategoria = categoria ? evento.categoria === categoria : true;
      const coincideBusqueda = evento.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase());
      const coincideEstado = estadoFiltro ? evento.estadoEvento === estadoFiltro : true;
      return coincideCategoria && coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => {
      return ordenamiento === 'asc'
        ? new Date(a.fecha) - new Date(b.fecha)
        : new Date(b.fecha) - new Date(a.fecha);
    });

  useEffect(() => {
    setEventosNoEncontrados(terminoBusqueda && eventosFiltrados.length === 0);
  }, [terminoBusqueda, eventosFiltrados]);

  const handleDelete = async (eventoId) => {
    const confirmDelete = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Este evento se eliminará permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/eventos/${eventoId}`);
        Swal.fire('Éxito', 'Evento eliminado exitosamente', 'success');
        setEventos(eventos.filter(evento => evento.id !== eventoId));
      } catch (error) {
        Swal.fire('Error', 'Ocurrió un error al eliminar el evento', 'error');
      }
    }
  };

  const TarjetaEvento = ({ evento }) => {
    return (
      <div className="rounded overflow-hidden shadow-lg flex flex-col transform hover:scale-105 transition duration-300 ease-in-out mt-12">
        <div className="relative">
          <img className="w-full" src={evento.imagen} alt={evento.nombre} />
          <div className="absolute inset-0 bg-gray-900 opacity-25 hover:bg-transparent transition duration-300"></div>
          <Link className="text-xs absolute top-0 right-0 bg-yellow-500 px-4 py-2 text-black mt-3 mr-3 no-underline transition duration-500 ease-in-out">
            {evento.categoria}
          </Link>
        </div>
        <div className="px-6 py-4 flex-1">
          <p className="font-medium text-lg inline-block transition duration-500 ease-in-out mb-2">{evento.nombre}</p>
          <p className="text-gray-500 text-sm mb-2">{evento.descripcion}</p>
          <p className="text-gray-900 font-semibold text-lg">{new Date(evento.fecha).toLocaleDateString()}</p>
          <p className="text-gray-500 text-sm mt-2">Estado: {evento.estadoEvento}</p>
          <p className="text-gray-500 text-sm mt-2">Cupos Disponibles: {evento.cantidadCupos}</p>
        </div>
        <div className="px-6 py-3 flex items-center justify-between bg-gray-100">
          <Link to={`/EditarEventos/${evento.id}`}
            className="flex items-center bg-yellow-500 hover:bg-yellow-300 text-black px-4 py-2 rounded transition duration-500 ease-in-out">
            <FontAwesomeIcon icon={faEdit} className="h-5 w-5 mr-2" />
            Editar
          </Link>
          <PDFDownloadLink
            document={<EventoPDF evento={evento} />}
            fileName={`reporte_${evento.nombre}.pdf`}
            className="flex items-center bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded transition duration-500 ease-in-out"
          >
            {({ blob, url, loading, error }) => (
              <>
                <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5 mr-2" />
                {loading ? 'Generando...' : 'PDF'}
              </>
            )}
          </PDFDownloadLink>
          <button
            className="flex items-center bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded transition duration-500 ease-in-out"
            onClick={() => handleDelete(evento.id)}
          >
            <FontAwesomeIcon icon={faTrash} className="h-5 w-5 mr-2" />
            Eliminar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-screen-xl mx-auto p-5 sm:p-10 md:p-16">
      <BarraAdmin />
      <div className="border-b mb-5 flex justify-between text-sm">
        <div className="text-black flex items-center pb-2 pr-2 border-b-2 border-black uppercase">
          <span className="font-semibold inline-block">Seleccione una Categoría</span>
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="text-black hover:underline"
        >
          <option value="">Todas</option>
          {['charlas', 'teatro', 'deportes', 'culturales', 'festivales'].map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <PDFDownloadLink
          document={<TodosEventosPDF eventos={eventosFiltrados} />}
          fileName="reporte_todos_eventos.pdf"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-500 ease-in-out"
        >
          {({ blob, url, loading, error }) =>
            loading ? 'Generando PDF...' : 'Descargar Reporte General'
          }
        </PDFDownloadLink>
      </div>

      <div className="mb-5 flex justify-between items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            placeholder="Buscar por nombre"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {terminoBusqueda && (
            <button onClick={() => setTerminoBusqueda('')} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 focus:outline-none">X</button>
          )}
        </div>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="text-black border border-gray-300 rounded px-4 py-2"
        >
          <option value="">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="cerrado">Cerrado</option>
          <option value="proximo">Próximo</option>
        </select>
        <button
          onClick={() => setOrdenamiento(ordenamiento === 'asc' ? 'desc' : 'asc')}
          className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-300 transition duration-500 ease-in-out"
        >
          Ordenar por fecha: {ordenamiento === 'asc' ? 'Más Cercano a Más Lejano' : 'Más Lejano a Más Cercano'}
        </button>
      </div>

      {eventosNoEncontrados ? (
        <p className="text-center text-gray-500 text-lg">No se encontraron eventos con el término de búsqueda.</p>
      ) : (
        <>
          {['charlas', 'teatro', 'deportes', 'culturales', 'festivales'].map(cat => (
            eventosFiltrados.filter(evento => evento.categoria === cat).length > 0 && (
              <div key={cat} className="mb-8">
                <h2 className="text-3xl font-bold mb-4 text-center text-black capitalize">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                  {eventosFiltrados.filter(evento => evento.categoria === cat).map(evento => (
                    <TarjetaEvento key={evento.id} evento={evento} />
                  ))}
                </div>
              </div>
            )
          ))}
        </>
      )}
    </div>
  );
};

export default RegistroEventosAdmin;