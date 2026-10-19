import React from 'react'
import ContinentCard from './ContinentCard'

export default function Continents({ continentResponse }) {
    return (
        <>
            <ContinentCard continentResponse={continentResponse} />
        </>
    )
}
