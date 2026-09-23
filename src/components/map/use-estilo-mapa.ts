import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

import { ESTILO_MAPA_PADRAO, isEstiloMapa, type EstiloMapa } from './estilos-mapa';

const CHAVE_ESTILO = '@intermedi/estilo-mapa';

export function useEstiloMapa() {
  const [estilo, setEstilo] = useState<EstiloMapa>(ESTILO_MAPA_PADRAO);
  const [erroPreferencia, setErroPreferencia] = useState('');
  const escolhaRef = useRef(0);
  const gravaçãoRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let ativo = true;
    void AsyncStorage.getItem(CHAVE_ESTILO).then(valor => {
      if (ativo && escolhaRef.current === 0 && isEstiloMapa(valor)) setEstilo(valor);
    }).catch(() => {
     
    });
    return () => { ativo = false; };
  }, []);

  function escolherEstilo(novoEstilo: EstiloMapa) {
    const escolha = ++escolhaRef.current;
    setEstilo(novoEstilo);
    setErroPreferencia('');
   
    gravaçãoRef.current = gravaçãoRef.current
      .then(() => AsyncStorage.setItem(CHAVE_ESTILO, novoEstilo))
      .catch(() => {
        if (escolha === escolhaRef.current) {
          setErroPreferencia('O mapa foi alterado, mas não foi possível salvar a preferência.');
        }
      });
  }

  return { estilo, escolherEstilo, erroPreferencia };
}
