"use client";

import { useState, useTransition } from "react";
import type {
  AboutCardData,
  MasterSectionData,
  MasterCardData,
  TimeSectionData,
  TimeCardData,
  EquipmentData,
  ServiceData,
} from "@/types/database";
import {
  saveAboutCards,
  saveMasterSection,
  saveTimeSection,
  saveEquipment,
  saveServicesLeak,
  saveServicesPipe,
} from "./actions";

/* ================================================================
   Types
   ================================================================ */

type Props = {
  aboutCards: AboutCardData[];
  masterSection: MasterSectionData;
  timeSection: TimeSectionData;
  equipment: EquipmentData[];
  servicesLeak: ServiceData[];
  servicesPipe: ServiceData[];
};

type TabKey = "about" | "master" | "time" | "equipment" | "services";

type Status = "idle" | "saving" | "saved" | "error";

const TABS: { key: TabKey; label: string }[] = [
  { key: "about", label: "회사소개" },
  { key: "master", label: "3대 약속" },
  { key: "time", label: "시간 강조" },
  { key: "equipment", label: "장비" },
  { key: "services", label: "서비스" },
];

/* ================================================================
   Shared UI helpers
   ================================================================ */

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

const cardCls = "rounded-xl border border-slate-200 bg-white p-4 sm:p-6";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-semibold text-slate-600">
      {children}
    </label>
  );
}

function ReorderButtons({
  index,
  total,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onMove(index, -1)}
        disabled={index === 0}
        className="px-1 text-sm text-slate-400 hover:text-slate-600 disabled:opacity-30"
        aria-label="위로 이동"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => onMove(index, 1)}
        disabled={index === total - 1}
        className="px-1 text-sm text-slate-400 hover:text-slate-600 disabled:opacity-30"
        aria-label="아래로 이동"
      >
        ▼
      </button>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="ml-2 text-sm text-red-600 hover:text-red-800"
        aria-label="삭제"
      >
        삭제
      </button>
    </div>
  );
}

function SaveBar({
  onSave,
  isPending,
  status,
  label = "저장",
}: {
  onSave: () => void;
  isPending: boolean;
  status: Status;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={isPending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {isPending ? "저장 중..." : label}
      </button>
      {status === "saved" && (
        <span className="text-sm font-medium text-emerald-600">
          저장되었습니다.
        </span>
      )}
      {status === "error" && (
        <span className="text-sm font-medium text-red-600">
          저장에 실패했습니다.
        </span>
      )}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

/* ================================================================
   Generic list helpers
   ================================================================ */

function moveItem<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function removeItem<T>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index);
}

/* ================================================================
   Main Component
   ================================================================ */

export function ContentEditor({
  aboutCards: initialAbout,
  masterSection: initialMaster,
  timeSection: initialTime,
  equipment: initialEquipment,
  servicesLeak: initialLeak,
  servicesPipe: initialPipe,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("about");

  /* ── About Cards state ── */
  const [about, setAbout] = useState<AboutCardData[]>(initialAbout);
  const [aboutStatus, setAboutStatus] = useState<Status>("idle");
  const [aboutPending, startAbout] = useTransition();

  /* ── Master Section state ── */
  const [master, setMaster] = useState<MasterSectionData>(initialMaster);
  const [masterStatus, setMasterStatus] = useState<Status>("idle");
  const [masterPending, startMaster] = useTransition();

  /* ── Time Section state ── */
  const [time, setTime] = useState<TimeSectionData>(initialTime);
  const [timeStatus, setTimeStatus] = useState<Status>("idle");
  const [timePending, startTime] = useTransition();

  /* ── Equipment state ── */
  const [equip, setEquip] = useState<EquipmentData[]>(initialEquipment);
  const [equipStatus, setEquipStatus] = useState<Status>("idle");
  const [equipPending, startEquip] = useTransition();

  /* ── Services state ── */
  const [leak, setLeak] = useState<ServiceData[]>(initialLeak);
  const [leakStatus, setLeakStatus] = useState<Status>("idle");
  const [leakPending, startLeak] = useTransition();

  const [pipe, setPipe] = useState<ServiceData[]>(initialPipe);
  const [pipeStatus, setPipeStatus] = useState<Status>("idle");
  const [pipePending, startPipe] = useTransition();

  /* ================================================================
     Tab 1: About Cards
     ================================================================ */

  function renderAbout() {
    function update(i: number, field: keyof AboutCardData, value: string) {
      setAbout((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
      );
      if (aboutStatus === "saved") setAboutStatus("idle");
    }

    return (
      <div className="space-y-4">
        {about.map((card, i) => (
          <div key={i} className={cardCls}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">카드 {i + 1}</span>
              <ReorderButtons
                index={i}
                total={about.length}
                onMove={(idx, dir) => {
                  setAbout((prev) => moveItem(prev, idx, dir));
                  if (aboutStatus === "saved") setAboutStatus("idle");
                }}
                onRemove={(idx) => {
                  setAbout((prev) => removeItem(prev, idx));
                  if (aboutStatus === "saved") setAboutStatus("idle");
                }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>이미지 경로 (src)</Label>
                <input type="text" value={card.src} onChange={(e) => update(i, "src", e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>이미지 설명 (alt)</Label>
                <input type="text" value={card.alt} onChange={(e) => update(i, "alt", e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>아이콘 이름 (icon)</Label>
                <input type="text" value={card.icon} onChange={(e) => update(i, "icon", e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>문구 1 (line1)</Label>
                <input type="text" value={card.line1} onChange={(e) => update(i, "line1", e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label>문구 2 (line2)</Label>
                <input type="text" value={card.line2} onChange={(e) => update(i, "line2", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <AddButton
            label="카드 추가"
            onClick={() => {
              setAbout((prev) => [...prev, { src: "", alt: "", icon: "", line1: "", line2: "" }]);
              if (aboutStatus === "saved") setAboutStatus("idle");
            }}
          />
          <SaveBar
            onSave={() => {
              setAboutStatus("saving");
              startAbout(async () => {
                try {
                  await saveAboutCards(about);
                  setAboutStatus("saved");
                } catch {
                  setAboutStatus("error");
                }
              });
            }}
            isPending={aboutPending}
            status={aboutStatus}
          />
        </div>
      </div>
    );
  }

  /* ================================================================
     Tab 2: Master Section
     ================================================================ */

  function renderMaster() {
    function updateTop(field: "title" | "subtitle" | "cta", value: string) {
      setMaster((prev) => ({ ...prev, [field]: value }));
      if (masterStatus === "saved") setMasterStatus("idle");
    }

    function updateCard(i: number, field: keyof MasterCardData, value: string) {
      setMaster((prev) => ({
        ...prev,
        cards: prev.cards.map((c, idx) =>
          idx === i ? { ...c, [field]: value } : c,
        ),
      }));
      if (masterStatus === "saved") setMasterStatus("idle");
    }

    return (
      <div className="space-y-4">
        <div className={cardCls}>
          <Label>제목 (줄바꿈: \n)</Label>
          <textarea
            rows={2}
            value={master.title}
            onChange={(e) => updateTop("title", e.target.value)}
            className={inputCls}
          />

          <div className="mt-3">
            <Label>부제목 (subtitle)</Label>
            <input
              type="text"
              value={master.subtitle}
              onChange={(e) => updateTop("subtitle", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="mt-3">
            <Label>CTA 문구</Label>
            <input
              type="text"
              value={master.cta}
              onChange={(e) => updateTop("cta", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-700">카드 목록</h3>

        {master.cards.map((card, i) => (
          <div key={i} className={cardCls}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">카드 {i + 1}</span>
              <ReorderButtons
                index={i}
                total={master.cards.length}
                onMove={(idx, dir) => {
                  setMaster((prev) => ({
                    ...prev,
                    cards: moveItem(prev.cards, idx, dir),
                  }));
                  if (masterStatus === "saved") setMasterStatus("idle");
                }}
                onRemove={(idx) => {
                  setMaster((prev) => ({
                    ...prev,
                    cards: removeItem(prev.cards, idx),
                  }));
                  if (masterStatus === "saved") setMasterStatus("idle");
                }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>키 (key)</Label>
                <input type="text" value={card.key} onChange={(e) => updateCard(i, "key", e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>아이콘 (icon)</Label>
                <input type="text" value={card.icon} onChange={(e) => updateCard(i, "icon", e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label>비주얼 텍스트 (visualText, 선택)</Label>
                <input type="text" value={card.visualText ?? ""} onChange={(e) => updateCard(i, "visualText", e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label>본문 (body)</Label>
                <textarea rows={2} value={card.body} onChange={(e) => updateCard(i, "body", e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <Label>강조 문구 (highlight)</Label>
                <textarea rows={2} value={card.highlight} onChange={(e) => updateCard(i, "highlight", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <AddButton
            label="카드 추가"
            onClick={() => {
              setMaster((prev) => ({
                ...prev,
                cards: [...prev.cards, { key: "", icon: "", body: "", highlight: "" }],
              }));
              if (masterStatus === "saved") setMasterStatus("idle");
            }}
          />
          <SaveBar
            onSave={() => {
              setMasterStatus("saving");
              startMaster(async () => {
                try {
                  await saveMasterSection(master);
                  setMasterStatus("saved");
                } catch {
                  setMasterStatus("error");
                }
              });
            }}
            isPending={masterPending}
            status={masterStatus}
          />
        </div>
      </div>
    );
  }

  /* ================================================================
     Tab 3: Time Section
     ================================================================ */

  function renderTime() {
    function updateTop(field: "preTitle" | "title" | "description" | "footer", value: string) {
      setTime((prev) => ({ ...prev, [field]: value }));
      if (timeStatus === "saved") setTimeStatus("idle");
    }

    function updateCard(i: number, field: keyof TimeCardData, value: string) {
      setTime((prev) => ({
        ...prev,
        cards: prev.cards.map((c, idx) =>
          idx === i ? { ...c, [field]: value } : c,
        ),
      }));
      if (timeStatus === "saved") setTimeStatus("idle");
    }

    return (
      <div className="space-y-4">
        <div className={cardCls}>
          <Label>프리타이틀 (preTitle)</Label>
          <input
            type="text"
            value={time.preTitle}
            onChange={(e) => updateTop("preTitle", e.target.value)}
            className={inputCls}
          />

          <div className="mt-3">
            <Label>타이틀 (title)</Label>
            <input
              type="text"
              value={time.title}
              onChange={(e) => updateTop("title", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="mt-3">
            <Label>설명 (description)</Label>
            <textarea
              rows={3}
              value={time.description}
              onChange={(e) => updateTop("description", e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="mt-3">
            <Label>하단 문구 (footer)</Label>
            <input
              type="text"
              value={time.footer}
              onChange={(e) => updateTop("footer", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-700">카드 목록</h3>

        {time.cards.map((card, i) => (
          <div key={i} className={cardCls}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">카드 {i + 1}</span>
              <ReorderButtons
                index={i}
                total={time.cards.length}
                onMove={(idx, dir) => {
                  setTime((prev) => ({
                    ...prev,
                    cards: moveItem(prev.cards, idx, dir),
                  }));
                  if (timeStatus === "saved") setTimeStatus("idle");
                }}
                onRemove={(idx) => {
                  setTime((prev) => ({
                    ...prev,
                    cards: removeItem(prev.cards, idx),
                  }));
                  if (timeStatus === "saved") setTimeStatus("idle");
                }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>아이콘 (icon)</Label>
                <input type="text" value={card.icon} onChange={(e) => updateCard(i, "icon", e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>큰 텍스트 (big)</Label>
                <input type="text" value={card.big} onChange={(e) => updateCard(i, "big", e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>캡션 (caption)</Label>
                <input type="text" value={card.caption} onChange={(e) => updateCard(i, "caption", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <AddButton
            label="카드 추가"
            onClick={() => {
              setTime((prev) => ({
                ...prev,
                cards: [...prev.cards, { icon: "", big: "", caption: "" }],
              }));
              if (timeStatus === "saved") setTimeStatus("idle");
            }}
          />
          <SaveBar
            onSave={() => {
              setTimeStatus("saving");
              startTime(async () => {
                try {
                  await saveTimeSection(time);
                  setTimeStatus("saved");
                } catch {
                  setTimeStatus("error");
                }
              });
            }}
            isPending={timePending}
            status={timeStatus}
          />
        </div>
      </div>
    );
  }

  /* ================================================================
     Tab 4: Equipment
     ================================================================ */

  function renderEquipment() {
    function update(i: number, field: keyof EquipmentData, value: string) {
      setEquip((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
      );
      if (equipStatus === "saved") setEquipStatus("idle");
    }

    return (
      <div className="space-y-4">
        {equip.map((item, i) => (
          <div key={i} className={cardCls}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">장비 {i + 1}</span>
              <ReorderButtons
                index={i}
                total={equip.length}
                onMove={(idx, dir) => {
                  setEquip((prev) => moveItem(prev, idx, dir));
                  if (equipStatus === "saved") setEquipStatus("idle");
                }}
                onRemove={(idx) => {
                  setEquip((prev) => removeItem(prev, idx));
                  if (equipStatus === "saved") setEquipStatus("idle");
                }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>장비명 (name)</Label>
                <input type="text" value={item.name} onChange={(e) => update(i, "name", e.target.value)} className={inputCls} />
              </div>
              <div>
                <Label>설명 (caption)</Label>
                <input type="text" value={item.caption} onChange={(e) => update(i, "caption", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <AddButton
            label="장비 추가"
            onClick={() => {
              setEquip((prev) => [...prev, { name: "", caption: "" }]);
              if (equipStatus === "saved") setEquipStatus("idle");
            }}
          />
          <SaveBar
            onSave={() => {
              setEquipStatus("saving");
              startEquip(async () => {
                try {
                  await saveEquipment(equip);
                  setEquipStatus("saved");
                } catch {
                  setEquipStatus("error");
                }
              });
            }}
            isPending={equipPending}
            status={equipStatus}
          />
        </div>
      </div>
    );
  }

  /* ================================================================
     Tab 5: Services
     ================================================================ */

  function renderServices() {
    function renderGroup(
      title: string,
      items: ServiceData[],
      setItems: React.Dispatch<React.SetStateAction<ServiceData[]>>,
      status: Status,
      setStatus: React.Dispatch<React.SetStateAction<Status>>,
      isPending: boolean,
      startSave: (fn: () => Promise<void>) => void,
      saveFn: (data: ServiceData[]) => Promise<void>,
      addLabel: string,
    ) {
      function update(i: number, field: keyof ServiceData, value: string) {
        setItems((prev) =>
          prev.map((item, idx) => {
            if (idx !== i) return item;
            if (field === "cat") {
              return { ...item, cat: value === "" ? null : value };
            }
            return { ...item, [field]: value };
          }),
        );
        if (status === "saved") setStatus("idle");
      }

      return (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>

          {items.map((item, i) => (
            <div key={i} className={cardCls}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">항목 {i + 1}</span>
                <ReorderButtons
                  index={i}
                  total={items.length}
                  onMove={(idx, dir) => {
                    setItems((prev) => moveItem(prev, idx, dir));
                    if (status === "saved") setStatus("idle");
                  }}
                  onRemove={(idx) => {
                    setItems((prev) => removeItem(prev, idx));
                    if (status === "saved") setStatus("idle");
                  }}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>카테고리 (cat, 비우면 null)</Label>
                  <input type="text" value={item.cat ?? ""} onChange={(e) => update(i, "cat", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <Label>한국어명 (ko)</Label>
                  <input type="text" value={item.ko} onChange={(e) => update(i, "ko", e.target.value)} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <Label>설명 (desc)</Label>
                  <input type="text" value={item.desc} onChange={(e) => update(i, "desc", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <Label>아이콘 (icon)</Label>
                  <input type="text" value={item.icon} onChange={(e) => update(i, "icon", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <Label>링크 (href, 선택)</Label>
                  <input type="text" value={item.href ?? ""} onChange={(e) => update(i, "href", e.target.value)} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <Label>이미지 (image, 선택)</Label>
                  <input type="text" value={item.image ?? ""} onChange={(e) => update(i, "image", e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <AddButton
              label={addLabel}
              onClick={() => {
                setItems((prev) => [
                  ...prev,
                  { cat: null, ko: "", desc: "", icon: "" },
                ]);
                if (status === "saved") setStatus("idle");
              }}
            />
            <SaveBar
              onSave={() => {
                setStatus("saving");
                startSave(async () => {
                  try {
                    await saveFn(items);
                    setStatus("saved");
                  } catch {
                    setStatus("error");
                  }
                });
              }}
              isPending={isPending}
              status={status}
              label={`${title} 저장`}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {renderGroup(
          "누수 관련",
          leak,
          setLeak,
          leakStatus,
          setLeakStatus,
          leakPending,
          startLeak,
          saveServicesLeak,
          "누수 서비스 추가",
        )}

        <hr className="border-slate-200" />

        {renderGroup(
          "배관·세척",
          pipe,
          setPipe,
          pipeStatus,
          setPipeStatus,
          pipePending,
          startPipe,
          saveServicesPipe,
          "배관 서비스 추가",
        )}
      </div>
    );
  }

  /* ================================================================
     Main render
     ================================================================ */

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "about" && renderAbout()}
      {activeTab === "master" && renderMaster()}
      {activeTab === "time" && renderTime()}
      {activeTab === "equipment" && renderEquipment()}
      {activeTab === "services" && renderServices()}
    </div>
  );
}
