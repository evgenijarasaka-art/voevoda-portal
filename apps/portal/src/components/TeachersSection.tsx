import { useState } from "react";
import { TeacherCard } from "./TeacherCard";
import { TeacherModal } from "./TeacherModal";

const teachers = [
  {
    name: "Александр Суворов",
    rank: "Полковник",
    position: "Инструктор по тактике",
    photo: "ТС",
    index: 4.8,
  },
  {
    name: "Дмитрий Донской",
    rank: "Майор",
    position: "Огневая подготовка",
    photo: "ОП",
    index: 4.6,
  },
  {
    name: "Михаил Кутузов",
    rank: "Подполковник",
    position: "Стратегия",
    photo: "СТ",
    index: 4.7,
  },
  {
    name: "Георгий Жуков",
    rank: "Генерал",
    position: "Командир курса",
    photo: "КК",
    index: 4.9,
  },
];

export function TeachersSection() {
  const [selectedTeacher, setSelectedTeacher] = useState<{
    name: string;
    rank: string;
    position: string;
    photo: string;
    index: number;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = (teacher: {
    name: string;
    rank: string;
    position: string;
    photo: string;
    index: number;
  }) => {
    setSelectedTeacher(teacher);
    setModalOpen(true);
  };

  return (
    <section style={{ padding: "24px 24px 0" }}>
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#111111",
              margin: 0,
            }}
          >
            Преподаватели и командиры
          </h2>
          <button
            className="voevoda-view-all voevoda-view-all--inverse"
            onClick={() => window.alert("Список преподавателей открыт в демо-режиме")}
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: "12px",
              padding: "8px 16px",
              fontSize: "14px",
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Все →
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {teachers.map((t, i) => (
            <TeacherCard key={i} {...t} onClick={() => handleCardClick(t)} />
          ))}
        </div>
      </div>

      {selectedTeacher && (
        <TeacherModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          teacher={selectedTeacher}
        />
      )}
    </section>
  );
}
