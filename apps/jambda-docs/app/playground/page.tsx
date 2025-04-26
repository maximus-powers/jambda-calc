"use client"

import { useState } from "react"
import CodeEditor from "@/components/code-editor"
import ThemeToggle from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyIcon, CheckIcon, Code2Icon, ImageIcon, AlertCircleIcon } from "lucide-react"
import { jambdaClient } from "@/lib/jambda-client"

export default function PlaygroundPage() {
  const [code, setCode] = useState(
    `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}`,
  )
  const [lambdaOutput, setLambdaOutput] = useState("")
  const [diagramSvg, setDiagramSvg] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("lambda")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranspile = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const lambdaExpression = await jambdaClient.transpile(code);
      setLambdaOutput(lambdaExpression);
      setActiveTab("lambda");
    } catch (err) {
      console.error("Transpilation error:", err);
      setError(`Transpilation error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleVisualize = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const lambdaExpression = await jambdaClient.transpile(code);
      setLambdaOutput(lambdaExpression);

      const visualizationOptions = {
        padding: 60,
        backgroundColor: "#FFFFFF"
      };
      const svg = await jambdaClient.visualize(lambdaExpression, visualizationOptions);
      setDiagramSvg(svg);
      setActiveTab("diagram");
    } catch (err) {
      console.error("Visualization error:", err);
      setError(`Visualization error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lambdaOutput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Interactive Playground</h1>
        <ThemeToggle />
      </div>

      <p className="text-lg">
        Write JavaScript or TypeScript code below to transpile it to lambda calculus and visualize it as a Tromp
        diagram.
      </p>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Input</h2>
            <div className="flex space-x-2">
              <Button onClick={handleTranspile} disabled={isProcessing} variant="outline">
                {isProcessing ? "Processing..." : "Transpile"}
              </Button>
              <Button onClick={handleVisualize} disabled={isProcessing} variant="default">
                {isProcessing ? "Processing..." : "Visualize"}
              </Button>
            </div>
          </div>
          <CodeEditor value={code} onChange={setCode} language="javascript" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Output</h2>
            <div className="w-[400px]">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="lambda" className="flex items-center gap-2">
                    <Code2Icon className="h-4 w-4" />
                    <span>Lambda Expression</span>
                  </TabsTrigger>
                  <TabsTrigger value="diagram" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Tromp Diagram</span>
                  </TabsTrigger>
                </TabsList>

                <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 min-h-[400px] mt-4">
                  <TabsContent value="lambda" className="m-0 h-full">
                    {lambdaOutput ? (
                      <div className="relative h-full">
                        <div className="absolute top-2 right-2">
                          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8 w-8 p-0">
                            {copied ? (
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <CopyIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="p-4 font-mono text-sm overflow-auto h-[400px]">
                          {lambdaOutput}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <Code2Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Click &quot;Transpile&quot; to convert your code to lambda calculus</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="diagram" className="m-0 h-full">
                    {diagramSvg ? (
                      <div className="flex items-center justify-center p-4 h-[400px]">
                        <div 
                          className="max-w-full max-h-full object-contain" 
                          dangerouslySetInnerHTML={{ __html: diagramSvg }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Click &quot;Visualize&quot; to generate a Tromp diagram</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-8">
        <h3 className="text-lg font-semibold mb-4">About Jambda-Calc Playground</h3>
        <p className="mb-3">
          This playground allows you to experiment with the Jambda-Calc library, which transpiles JavaScript/TypeScript
          code into lambda calculus and visualizes it using Tromp diagrams.
        </p>
        <p className="mb-3">
          <strong>Transpile:</strong> Converts your code to lambda calculus notation.
        </p>
        <p>
          <strong>Visualize:</strong> Generates a Tromp diagram representation of the lambda calculus expression.
        </p>
      </div>
    </div>
  )
}
