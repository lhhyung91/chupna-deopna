import { createContext, useContext } from 'react';

const EntranceContext = createContext(false);

export const EntranceProvider = EntranceContext.Provider;

// 첫 화면 뒤에 새로 붙는 것(탭 전환·↻로 바뀐 옷)만 움직인다. 처음 열 때 하나씩 나타나면 로딩이 덜 끝난 것처럼 보였다(웹 useEntrance와 같은 규칙)
export const useEntrance = () => useContext(EntranceContext);
