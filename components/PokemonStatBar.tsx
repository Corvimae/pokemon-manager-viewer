import styled from 'styled-components';
import { useTypedSelector, setCombatStage, setHealth, setBaseStat, setAddedStat } from '../store/store';
import { useCalculatedAttackStat, useCalculatedDefenseStat, useCalculatedSpecialAttackStat, useCalculatedSpecialDefenseStat, useCalculatedSpeedStat, useTotalHP, useTrainerHasClass } from '../utils/formula';
import { useDispatch } from 'react-redux';
import { useCallback, useState } from 'react';
import { CombatStages } from '../utils/types';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { IconButton, Button, NumericInput, DropdownHeader } from './Layout';
import { Theme } from '../utils/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { calculateLevel } from '../utils/level';

interface StatEditorProps { 
  stat: keyof CombatStages | "hp";
}

const StatEditor: React.FC<StatEditorProps> = ({ stat }) => {
  const dispatch = useDispatch();
  const pokemonId = useTypedSelector(state => state.pokemon.id);
  const { base, added } = useTypedSelector(state => state.pokemon.stats);

  const handleChangeBaseStat = useCallback(event => {
    dispatch(setBaseStat(pokemonId, stat, event.target.value));
  }, [dispatch, stat, pokemonId]);

  const handleChangeAddedStat = useCallback(event => {
    dispatch(setAddedStat(pokemonId, stat, event.target.value));
  }, [dispatch, stat, pokemonId]);

  return (
    <StatEditContainer>
      <DropdownHeader>Base</DropdownHeader>
      <div />
      <DropdownHeader>Added</DropdownHeader>
      <NumericInput type="number" onChange={handleChangeBaseStat} defaultValue={base[stat]} />
      <StatEditPlus>
        <FontAwesomeIcon icon={faPlus} size="xs" />
      </StatEditPlus>
      <NumericInput type="number" onChange={handleChangeAddedStat} defaultValue={added[stat]} />
    </StatEditContainer>
  );
};
 
interface CombatStageModifierProps { 
  area: string;
  stat: keyof CombatStages;
}

const CombatStageModifier: React.FC<CombatStageModifierProps> = ({ area, stat }) => {
  const dispatch = useDispatch();
  const editMode = useTypedSelector(state => state.editMode);
  const pokemonId = useTypedSelector(state => state.pokemon.id);
  const combatStages = useTypedSelector(state => state.pokemon.stats.combatStages);

  const handleSetCombatStage = useCallback((amount: number) => {
    dispatch(setCombatStage(pokemonId, stat, combatStages[stat] + amount));
  }, [dispatch, pokemonId, combatStages, stat]);

  return (
    <CombatStageCell area={area}>
      {!editMode && (
        <>
          <CombatStageButton icon={faMinus} onClick={() => handleSetCombatStage(-1)} />
          <CombatStageValue>
            {combatStages[stat]}
          </CombatStageValue>
          <CombatStageButton icon={faPlus} onClick={() => handleSetCombatStage(1)} />
        </>
      )}
      {editMode && <StatEditor stat={stat} />}
    </CombatStageCell>
  )
}
export const PokemonStatBar = () => {
  const dispatch = useDispatch();
  const mobileMode = useTypedSelector(store => store.mobileMode);
  const editMode = useTypedSelector(state => state.editMode);
  const pokemonId = useTypedSelector(state => state.pokemon.id);
  const experience = useTypedSelector(store => store.pokemon.experience);
  const stats = useTypedSelector(store => store.pokemon.stats);
  const currentHealth = useTypedSelector(store => store.currentHealth);

  const [modifyHealthValue, setModifyHealthValue] = useState(1);

  const level = calculateLevel(experience)
  const totalHealth = useTotalHP();
  const attack = useCalculatedAttackStat();
  const defense = useCalculatedDefenseStat();
  const specialAttack = useCalculatedSpecialAttackStat();
  const specialDefense = useCalculatedSpecialDefenseStat();
  const speed = useCalculatedSpeedStat();

  const showPressOnThreshold = useTrainerHasClass('Enduring Soul');

  const pointsOverCap = Object.values(stats.added).reduce((acc, value) => acc + value, 0) - level;

  const updateHealth = useCallback((value: number) => {
    dispatch(setHealth(pokemonId, value));
  }, [dispatch, pokemonId]);

  return (
    <Container isActiveMobileMode={mobileMode === 'stats'}>
      <Title area="hp">HP</Title>
      <Title area="atk">Attack</Title>
      <Title area="def">Defense</Title>
      <Title area="spatk">Sp. Attack</Title>
      <Title area="spdef">Sp. Defense</Title>
      <Title area="spd">Speed</Title>
      <StatTotal area="hp">
        <div>
          <CurrentHealth>{currentHealth}&nbsp;</CurrentHealth>
          <TotalHealth>/&nbsp;{totalHealth}</TotalHealth>
        </div>
        <StatCalculation>({stats.base.hp} + {stats.added.hp})</StatCalculation>
      </StatTotal>
      <StatTotal area="atk">
        <TotalValue>{attack}</TotalValue>
        <StatCalculation>({stats.base.attack} + {stats.added.attack})</StatCalculation>
      </StatTotal>
      <StatTotal area="def">
        <TotalValue>{defense}</TotalValue>
        <StatCalculation>({stats.base.defense} + {stats.added.defense})</StatCalculation>
      </StatTotal>
      <StatTotal area="spatk">
        <TotalValue>{specialAttack}</TotalValue>
        <StatCalculation>({stats.base.spattack} + {stats.added.spattack})</StatCalculation>
      </StatTotal>
      <StatTotal area="spdef">
        <TotalValue>{specialDefense}</TotalValue>
        <StatCalculation>({stats.base.spdefense} + {stats.added.spdefense})</StatCalculation>
      </StatTotal>
      <StatTotal area="spd">
        <TotalValue>{speed}</TotalValue>
        <StatCalculation>({stats.base.speed} + {stats.added.speed})</StatCalculation>
      </StatTotal>
      <HealthCell>
        {!editMode && (
          <>
            <AddSubtractHealthButtons>
              <CombatStageButton icon={faMinus} onClick={() => updateHealth(currentHealth - modifyHealthValue)}/>
              <HealthModifyInput
                type="number"
                onChange={event => setModifyHealthValue(Number(event.target.value))}
                defaultValue={modifyHealthValue}
              /> 
              <CombatStageButton icon={faPlus} onClick={() => updateHealth(currentHealth + modifyHealthValue)}/>
            </AddSubtractHealthButtons>
            <HealthCellDropdown>
              <HealthModifyButton onClick={() => updateHealth(modifyHealthValue)}>
                Set health to value
              </HealthModifyButton>
              <HealthModifyButton  onClick={() => updateHealth(totalHealth)}>
                Heal to full
              </HealthModifyButton>
              {showPressOnThreshold && (
                <PressOnThreshold>Press On (-25%):
                  <PressOnValue>&nbsp;-{Math.ceil(totalHealth / 4)}</PressOnValue>
                </PressOnThreshold>
              )}
            </HealthCellDropdown>
          </>
        )}
        {editMode && <StatEditor stat="hp" />}
      </HealthCell>
      <CombatStageModifier area="atk" stat="attack" />
      <CombatStageModifier area="def" stat="defense" />
      <CombatStageModifier area="spatk" stat="spattack" />
      <CombatStageModifier area="spdef" stat="spdefense" />
      <CombatStageModifier area="spd" stat="speed" />
      {pointsOverCap > 0 && (
        <StatAllocationWarning over>
          Your Pokémon has {pointsOverCap} too many allocated stat points.
        </StatAllocationWarning>
      )}
      {pointsOverCap < 0 && (
        <StatAllocationWarning>
          Your Pokémon has {Math.abs(pointsOverCap)} unspent stat point{pointsOverCap < -1 && 's'}.
        </StatAllocationWarning>
      )}
    </Container>
  );
};

const Title = styled.div`
  && {
    grid-area: ${props => props.area}-header;
    background-color: #dadada;
    font-weight: 700;
  }
`;

const StatTotal = styled.div`
  && {
    display: flex;
    flex-direction: column;
    grid-area: ${props => props.area}-value;
    background-color: #fff;
  }
`;

const StatCalculation = styled.div`
  margin-top: 0.125rem;
  font-size: 0.75rem;
  color: #666;
  font-style: italic;
`;

const CombatStageButton = styled(IconButton)`
  & > div {
    width: 1rem;
    height: 1rem;
  }

  &&& svg {
    font-size: 0.5rem;
    width: 0.75rem;
  }
`;

const CombatStageCell = styled.div`
  grid-area: ${props => props.area}-stages;
  background-color: #fff;
`;

const CombatStageValue = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  width: 2rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
`;

const HealthCellDropdown = styled.div`
  position: absolute;
  display: none;
  top: 100%;
  left: 0;
  width: max-content;
  padding: 0.5rem;
  background-color: #fff;
  flex-direction: column;
  box-shadow: 0 0.5rem 1rem 0 rgba(0, 0, 0, 0.1);
`;

const HealthCell = styled.div`
  position: relative;
  display: flex;
  min-width: max-content;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  overflow: visible;

  &:hover ${HealthCellDropdown} {
    display: flex;
  }
`;

const AddSubtractHealthButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const HealthModifyButton = styled(Button)`
  font-size: 0.75rem;
  min-width: max-content;

  &:not(:last-child) {
    margin-bottom: 0.25rem;
  }
`;

const HealthModifyInput = styled(NumericInput)`
  width: 3rem;
  margin: 0 0.25rem;
`;

const CurrentHealth = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
`;

const TotalHealth = styled.span`
  color: #666;
  font-size: 0.875rem;
`;

const StatEditContainer = styled.div`
  display: grid;
  grid-template-columns: 2.5rem max-content 2.5rem;

  & ${DropdownHeader} {
    margin: 0;
  }
`;

const StatEditPlus = styled.div`
  margin: 0 0.25rem;
  
  & svg {
    color: #999;
  }
`;

const TotalValue = styled.div`
  font-weight: 700;
`;

const StatAllocationWarning = styled.div<{ over?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  grid-column: 1 / -1;
  padding: 0.25rem 1rem;
  background-color: ${props => props.over ? '#c31717' : '#1b7d15'};
  color: #fff;
`;

const Container = styled.div<{ isActiveMobileMode: boolean }>`
  position: relative;
  display: grid;
  width: max-content;
  grid-template-columns: repeat(6, max-content);
  grid-template-areas: "hp-header atk-header def-header spatk-header spdef-header spd-header"
                       "hp-value atk-value def-value spatk-value spdef-value spd-value"
                       "hp-stages atk-stages def-stages spatk-stages spdef-stages spd-stages";
  height: max-content;
  box-shadow: ${Theme.dropShadow};
  z-index: 1;

  & > div {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0.25rem 0.5rem;
  }

  @media screen and (max-width: ${Theme.mobileThreshold}) {
    display: ${({ isActiveMobileMode }) => !isActiveMobileMode && 'none'};
    width: 100vw;
    min-width: 100vw;
    grid-auto-flow: row;
    padding-bottom: 2rem;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "hp-header hp-header"
                         "hp-value hp-stages"
                         "atk-header atk-header"
                         "atk-value atk-stages"
                         "def-header def-header"
                         "def-value def-stages"
                         "spatk-header spatk-header"
                         "spatk-value spatk-stages"
                         "spdef-header spdef-header"
                         "spdef-value spdef-stages"
                         "spd-header spd-header"
                         "spd-value spd-stages";

    & ${StatAllocationWarning} {
      position: fixed;
      bottom: 0;
      width: 100vw;
    }

    & ${StatTotal},
    & ${CombatStageCell},
    & ${HealthCell} {
      margin-bottom: 0.5rem;
    }
  }
`;

const PressOnThreshold = styled.div`
  font-size: 0.75rem;
  color: #333;
  text-align: center;
`;

const PressOnValue = styled.span`
  font-weight: 700;
`;
