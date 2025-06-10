import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConditionDropdown from "@/components/ConditionDropdown";

function SortableItem({ id, name, player, initiative, conditions, onEditConditions, isActive }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className={`p-4 ${isActive ? 'border-2 border-green-500' : ''}`}>
      <div className="font-bold">{name} ({player})</div>
      <div className="text-sm">Initiative: {initiative}</div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {conditions.map((c, i) => (
          <span key={i} className="px-2 py-1 text-xs rounded bg-yellow-200 text-black">{c}</span>
        ))}
      </div>
      <Button className="mt-2" onClick={() => onEditConditions(id)}>Edit Conditions</Button>
    </Card>
  );
}

export default function InitiativeTracker() {
  const [name, setName] = useState("");
  const [player, setPlayer] = useState("");
  const [initiative, setInitiative] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [participants, setParticipants] = useState([]);
  const [order, setOrder] = useState([]);
  const [combatStarted, setCombatStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0);
  const [log, setLog] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("dnd_players");
    if (stored) {
      const savedPlayers = JSON.parse(stored);
      setParticipants(savedPlayers);
    }
  }, []);

  const addParticipant = () => {
    if (name && player && initiative) {
      const newParticipant = {
        id: `${name}-${Math.random()}`,
        name,
        player,
        initiative: parseInt(initiative),
        conditions: selectedCondition ? [selectedCondition] : [],
      };
      const newParticipants = [...participants, newParticipant];
      setParticipants(newParticipants);
      if (player !== "enemy") {
        localStorage.setItem(
          "dnd_players",
          JSON.stringify(newParticipants.filter((p) => p.player !== "enemy"))
        );
      }
      setName("");
      setPlayer("");
      setInitiative("");
      setSelectedCondition("");
    }
  };

  const handleEditConditions = (id) => {
    const newCondition = prompt("Enter comma-separated conditions:");
    if (newCondition !== null) {
      setOrder((prev) =>
        prev.map((char) =>
          char.id === id
            ? {
                ...char,
                conditions: newCondition.split(",").map((c) => c.trim()),
              }
            : char
        )
      );
    }
  };

  const renderTimeline = () => (
    <div className="flex items-center space-x-2 mb-4">
      {Array.from({ length: round - 1 }, (_, i) => (
        <div key={i} className="w-3 h-3 bg-gray-500 rounded-full" />
      ))}
      <div
        className="w-4 h-4 bg-green-500 rounded-full border-2 border-black"
        title={`Round ${round}`}
      />
    </div>
  );

  const startCombat = () => {
    const sorted = [...participants].sort((a, b) => b.initiative - a.initiative);
    setOrder(sorted);
    setCombatStarted(true);
    setTurnIndex(0);
    setRound(1);
    setLog([{ round: 1, order: sorted.map((p) => p.name) }]);
  };

  const endCombat = () => {
    setCombatStarted(false);
    setOrder([]);
    setTurnIndex(0);
    setRound(1);
    setLog([]);
  };

  const nextTurn = () => {
    const nextIndex = (turnIndex + 1) % order.length;
    if (nextIndex === 0) {
      setRound((prev) => prev + 1);
      setLog((prev) => [...prev, { round: round + 1, order: order.map((p) => p.name) }]);
    }
    setTurnIndex(nextIndex);
  };

  const exportLog = () => {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "combat-log.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">D&D Initiative Tracker</h1>
      {renderTimeline()}

      <div className="mb-4 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Character or Enemy Name" />
        <Input value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="Player Name" />
        <Input value={initiative} onChange={(e) => setInitiative(e.target.value)} placeholder="Initiative Roll" type="number" />
        <ConditionDropdown selected={selectedCondition} onChange={setSelectedCondition} />
        <Button onClick={addParticipant}>Add</Button>
      </div>

      {!combatStarted ? (
        <Button onClick={startCombat}>Start Combat</Button>
      ) : (
        <div className="space-x-2 mb-4">
          <Button onClick={nextTurn}>Next Turn</Button>
          <Button onClick={endCombat}>End Combat</Button>
          <Button onClick={exportLog}>Export Log</Button>
        </div>
      )}

      {combatStarted && (
        <DndContext collisionDetection={closestCenter} onDragEnd={(event) => {
          const { active, over } = event;
          if (active.id !== over.id) {
            const oldIndex = order.findIndex((i) => i.id === active.id);
            const newIndex = order.findIndex((i) => i.id === over.id);
            setOrder((items) => arrayMove(items, oldIndex, newIndex));
          }
        }}>
          <SortableContext items={order.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-4">
              {order.map((p, index) => (
                <SortableItem
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  player={p.player}
                  initiative={p.initiative}
                  conditions={p.conditions}
                  isActive={index === turnIndex}
                  onEditConditions={handleEditConditions}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
