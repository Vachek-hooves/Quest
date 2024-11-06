import {createContext,useState,useEffect,useContext} from 'react';

export const AppContext=createContext();
export const AppProvider=({children})=>{

    

    const value={}


    return(<AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>)
}

export const useAppContext=()=>{
    const context=useContext(AppContext);
    if(!context){
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}       