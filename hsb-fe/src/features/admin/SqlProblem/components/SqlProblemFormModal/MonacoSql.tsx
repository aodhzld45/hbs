// src/features/SqlProblem/components/SqlProblemFormModal/MonacoSql.tsx
import React, {
  useMemo,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import type { editor as MonacoEditorNS, languages, Range, IDisposable } from 'monaco-editor';

/** =========================
 *  Types
 *  ========================= */
export type ConstraintRule = 'SELECT_ONLY' | 'DML_ALLOWED';

type SchemaSymbols = {
  tables?: Array<{ name: string; columns: string[] }>;
  functions?: string[];
};

export type MonacoSqlHandle = {
  getValue: () => string;
  setValue: (v: string) => void;
  focus: () => void;
  run: () => void; // selection 우선 실행
  beautify: () => void;
  toggleComment: () => void;
  toUpperSelection: () => void;
};

type Props = {
  /** RHF 필드 경로 (예: "answerSql" | `multiSql.0` | `testcases.0.setupSql`) */
  name: string;
  label?: string;
  height?: number | string; // e.g., 280 | "40vh"
  readOnly?: boolean;
  placeholder?: string;
  /** Ctrl/Cmd + Enter 시 호출 (옵션) */
  onRun?: (value: string) => void;
  /** 디바운스(ms). 기본 200ms */
  debounceMs?: number;
  /** 에디터 우측 상단 커스텀 액션 */
  rightActions?: React.ReactNode;
  /** 라이트/다크 테마 선택 (기본: vs-dark) */
  theme?: 'vs-dark' | 'light';
  /** 문제 제약: SELECT_ONLY면 DML 금지 린팅 */
  constraintRule?: ConstraintRule;
  /** 스키마 메타(테이블/컬럼/함수) 기반 자동완성 보강 */
  schemaSymbols?: SchemaSymbols;
};

/** =========================
 *  Const
 *  ========================= */
const SQL_KEYWORDS = [
  'SELECT','FROM','WHERE','GROUP BY','HAVING','ORDER BY','LIMIT','OFFSET',
  'INSERT','INTO','VALUES','UPDATE','SET','DELETE',
  'JOIN','LEFT JOIN','RIGHT JOIN','FULL JOIN','INNER JOIN','OUTER JOIN','ON',
  'CREATE','TABLE','PRIMARY KEY','FOREIGN KEY','NOT NULL','DEFAULT',
  'ALTER','ADD','DROP','TRUNCATE','INDEX',
  'COUNT','SUM','AVG','MIN','MAX','DISTINCT',
  'AND','OR','NOT','IN','BETWEEN','LIKE','IS NULL','IS NOT NULL',
];

const DML_WORDS = ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ALTER', 'DROP', 'CREATE'];

/** =========================
 *  Util functions
 *  ========================= */
function buildSchemaSuggestions(
  monaco: typeof import('monaco-editor'),
  range: Range,
  schema?: SchemaSymbols
): languages.CompletionItem[] {
  const items: languages.CompletionItem[] = [];

  schema?.tables?.forEach((t) => {
    items.push({
      label: t.name,
      kind: monaco.languages.CompletionItemKind.Struct,
      insertText: t.name,
      detail: 'table',
      range,
    });
    t.columns.forEach((c) => {
      items.push({
        label: `${t.name}.${c}`,
        kind: monaco.languages.CompletionItemKind.Field,
        insertText: `${t.name}.${c}`,
        detail: 'column',
        range,
      });
    });
  });

  (schema?.functions ?? []).forEach((fn) => {
    items.push({
      label: fn,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: `${fn}($0)`,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'function',
      range,
    });
  });

  return items;
}

function validateSql(
  monaco: typeof import('monaco-editor'),
  model: MonacoEditorNS.ITextModel,
  rule?: ConstraintRule
) {
  // rule 없거나 DML_ALLOWED면 마커 제거
  if (!rule || rule === 'DML_ALLOWED') {
    monaco.editor.setModelMarkers(model, 'sql-rule', []);
    return;
  }

  const text = model.getValue() || '';
  const markers: MonacoEditorNS.IMarkerData[] = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((line, i) => {
    DML_WORDS.forEach((w) => {
      const regex = new RegExp(`\\b${w}\\b`, 'i');
      const m = regex.exec(line);
      if (m && typeof m.index === 'number') {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: `이 문제는 SELECT_ONLY 입니다. "${w}" 사용 불가`,
          startLineNumber: i + 1,
          startColumn: m.index + 1,
          endLineNumber: i + 1,
          endColumn: m.index + w.length + 1,
        });
      }
    });
  });

  monaco.editor.setModelMarkers(model, 'sql-rule', markers);
}

const MonacoSql = forwardRef<MonacoSqlHandle, Props>(function MonacoSql(
  {
    name,
    label,
    height = 320,
    readOnly = false,
    placeholder = '/* 여기에 SQL을 입력하세요 */',
    onRun,
    debounceMs = 200,
    rightActions,
    theme = 'vs-dark',
    constraintRule,
    schemaSymbols,
  },
  ref
) {
  const { control } = useFormContext();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastValRef = useRef<string>('');
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const completionDisposableRef = useRef<IDisposable | null>(null);

  /** ---------- 에디터 옵션 ---------- */
  const options: MonacoEditorNS.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      readOnly,
      wordWrap: 'on',
      minimap: { enabled: false },
      automaticLayout: true,
      scrollbar: { vertical: 'auto', horizontal: 'auto' },
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      renderLineHighlight: 'all',
      quickSuggestions: { other: true, comments: false, strings: true },
      suggest: { preview: true },
      formatOnPaste: false, // 예기치 않은 들여쓰기 방지를 위해 false 권장
      formatOnType: false,
      lineNumbersMinChars: 3,
      readOnlyMessage: { value: '읽기 전용입니다.' },
    }),
    [readOnly]
  );

  /** ---------- 언마운트 정리 ---------- */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // 자동완성 provider 정리
      completionDisposableRef.current?.dispose();
      completionDisposableRef.current = null;
      // 에디터 인스턴스 정리
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, []);

  /** ---------- 유틸 액션 ---------- */
  const beautify = () => {
    const e = editorRef.current;
    if (!e) return;
    const v = e.getValue() || '';
    const nv = v
      .replace(/;+(\s)*/g, ';\n') // ; 뒤 줄바꿈
      .replace(/\t/g, '  ') // 탭 -> 스페이스 2
      .replace(/[ ]{3,}/g, ' ') // 과도한 공백 축소
      .trim();
    e.executeEdits('fmt', [
      { range: e.getModel()!.getFullModelRange(), text: nv },
    ]);
  };

  const toggleComment = () => {
    const e = editorRef.current;
    const m = monacoRef.current;
    if (!e || !m) return;
    e.trigger('toggleComment', 'editor.action.commentLine', null);
  };

  const toUpperSelection = () => {
    const e = editorRef.current;
    if (!e) return;
    const sel = e.getSelection();
    if (!sel || sel.isEmpty()) return;
    const text = e.getModel()!.getValueInRange(sel);
    e.executeEdits('upper', [{ range: sel, text: text.toUpperCase() }]);
  };

  /** ---------- 외부 제어 ref 노출 ---------- */
  useImperativeHandle(ref, (): MonacoSqlHandle => ({
    getValue: () => editorRef.current?.getValue() ?? '',
    setValue: (v: string) => {
      const e = editorRef.current;
      if (!e) return;
      e.executeEdits('set', [
        { range: e.getModel()!.getFullModelRange(), text: v ?? '' },
      ]);
    },
    focus: () => editorRef.current?.focus(),
    run: () => {
      const e = editorRef.current;
      if (!e) return;
      const model = e.getModel();
      const sel = e.getSelection();
      const hasSel = sel && !sel.isEmpty();
      const sql = hasSel ? model!.getValueInRange(sel!) : e.getValue() || '';
      onRun?.(sql);
    },
    beautify,
    toggleComment,
    toUpperSelection,
  }), [onRun]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {label && <span className="text-sm font-medium">{label}</span>}
        {rightActions}
      </div>

      <Controller
        control={control}
        name={name as any}
        render={({ field }) => (
          <div className="relative">
            {/* Placeholder Overlay (값 없을 때만) */}
            {!field.value && (
              <div className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400 z-10">
                {placeholder}
              </div>
            )}

            <Editor
              height={height}
              defaultLanguage="sql"
              theme={theme}
              options={options}
              value={(field.value ?? '') as string}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;

                // 자동완성 provider 등록(중복방지: 기존 등록 제거 후 재등록)
                completionDisposableRef.current?.dispose();
                completionDisposableRef.current = monaco.languages.registerCompletionItemProvider('sql', {
                  provideCompletionItems: (model, position) => {
                    const word = model.getWordUntilPosition(position);
                    const range: Range = new monaco.Range(
                      position.lineNumber,
                      word.startColumn,
                      position.lineNumber,
                      word.endColumn
                    );

                    const keywordSuggestions: languages.CompletionItem[] =
                      SQL_KEYWORDS.map((kw) => ({
                        label: kw,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: kw,
                        range,
                      }));

                    const schemaSuggestions = buildSchemaSuggestions(
                      monaco,
                      range,
                      schemaSymbols
                    );

                    return { suggestions: [...keywordSuggestions, ...schemaSuggestions] };
                  },
                });

                // Ctrl/Cmd + Enter → 선택 영역 우선 실행
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                  const model = editor.getModel();
                  const sel = editor.getSelection();
                  const hasSelection = sel && !sel.isEmpty();
                  const sql = hasSelection
                    ? model!.getValueInRange(sel!)
                    : editor.getValue() || '';
                  onRun?.(sql);
                });

                // Ctrl/Cmd + S → 간단 포맷팅
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                  beautify();
                });

                // ESC → blur
                editor.addCommand(monaco.KeyCode.Escape, () => {
                  editor.trigger('keyboard', 'editor.blur', null);
                });

                // RHF blur 처리
                editor.onDidBlurEditorText(() => {
                  field.onBlur();
                });

                // 린팅 초기/변경시
                const model = editor.getModel();
                if (model) {
                  validateSql(monaco, model, constraintRule);
                  editor.onDidChangeModelContent(() => {
                    validateSql(monaco, model, constraintRule);
                  });
                }
              }}
              onChange={(v) => {
                const next = (v ?? '') as string;
                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                  timerRef.current = null;
                }
                timerRef.current = setTimeout(() => {
                  if (next !== lastValRef.current) {
                    field.onChange(next);
                    lastValRef.current = next; // 변경 후 기록
                  }
                }, debounceMs);
              }}
            />
          </div>
        )}
      />
    </div>
  );
});

export default MonacoSql;
