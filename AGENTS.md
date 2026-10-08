<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Mock-backed feature data lives in src/data/*.mock.ts and is read only through src/lib/services/* (one method per future FastAPI endpoint), so swapping to the real API never touches UI. Why: UI-first demos must connect to FastAPI later without rewrites.
