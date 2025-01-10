export default function Home() {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex-1 overflow-y-auto">
        {/* Message list will go here */}
        <div className="space-y-4">
          <div className="rounded bg-muted p-4">
            <h2 className="text-lg font-semibold">Welcome to ChatGenius!</h2>
            <p className="text-muted-foreground">
              This is a placeholder message to test the layout.
            </p>
          </div>
        </div>
      </div>
      
      {/* Message input will go here */}
      <div className="mt-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Message input component will be implemented here...
          </p>
        </div>
      </div>
    </div>
  );
} 