var e={id:`summary`,h:{en:`Summary and exam checklist: SQLite cheat-sheet`,hi:`Summary aur exam checklist: SQLite cheat-sheet`},body:{en:`
<p><b>The idea of this chapter:</b> one page to review before an interview, a lab check or a real change. Read the checklist, test yourself on the glossary and the most-tested facts, then keep the cheat-sheet next to your keyboard.</p>

<h3>The module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Design, load, query, change safely, verify">
<rect x="5" y="40" width="118" height="60" rx="10" fill="#bae6fd"/><text x="64" y="64" text-anchor="middle" class="svg-ink" font-size="12">Design</text><text x="64" y="82" text-anchor="middle" class="svg-muted" font-size="10">tables, keys</text>
<rect x="132" y="40" width="118" height="60" rx="10" fill="#fde68a"/><text x="191" y="64" text-anchor="middle" class="svg-ink" font-size="12">Load</text><text x="191" y="82" text-anchor="middle" class="svg-muted" font-size="10">? and executemany</text>
<rect x="259" y="40" width="118" height="60" rx="10" fill="#ddd6fe"/><text x="318" y="64" text-anchor="middle" class="svg-ink" font-size="12">Query</text><text x="318" y="82" text-anchor="middle" class="svg-muted" font-size="10">SELECT, JOIN</text>
<rect x="386" y="40" width="118" height="60" rx="10" fill="#bbf7d0"/><text x="445" y="64" text-anchor="middle" class="svg-ink" font-size="12">Change safely</text><text x="445" y="82" text-anchor="middle" class="svg-muted" font-size="10">WHERE, commit</text>
<rect x="513" y="40" width="122" height="60" rx="10" fill="#fed7aa"/><text x="574" y="64" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="574" y="82" text-anchor="middle" class="svg-muted" font-size="10">from outside</text>
<line x1="123" y1="70" x2="132" y2="70" stroke="#64748b" stroke-width="2"/><line x1="250" y1="70" x2="259" y2="70" stroke="#64748b" stroke-width="2"/><line x1="377" y1="70" x2="386" y2="70" stroke="#64748b" stroke-width="2"/><line x1="504" y1="70" x2="513" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The habit loop of a database tool.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can create a table with <code>CREATE TABLE</code>, a primary key and <code>NOT NULL</code>, and list it with <code>.tables</code> and <code>.schema</code>.</li>
<li>I can connect from Python, execute, fetch with <code>fetchone</code> and <code>fetchall</code>, commit and close.</li>
<li>I can load a CSV with <code>executemany</code> and <code>?</code> placeholders, and explain why f-strings are dangerous.</li>
<li>I can filter, sort and limit with <code>WHERE</code>, <code>ORDER BY</code>, <code>LIKE</code>, <code>IN</code>, <code>LIMIT</code>, and I know <code>IS NULL</code>.</li>
<li>I can <code>UPDATE</code> and <code>DELETE</code> with a WHERE, check <code>rowcount</code>, and use <code>with conn</code> or rollback.</li>
<li>I can explain <code>UNIQUE</code>, <code>PRIMARY KEY</code>, <code>NOT NULL</code>, and the difference between plain INSERT, OR IGNORE and OR REPLACE.</li>
<li>I can join two tables, find missing rows with <code>LEFT JOIN ... IS NULL</code>, and group with <code>GROUP BY</code> and <code>HAVING</code>.</li>
<li>I can use <code>sqlite3.Row</code> and build a small CLI with exit codes.</li>
<li>I can debug the four classic bugs: string-built SQL, a column typo, a missing commit, a duplicate key.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Table, row, column</dt><dd>A grid of data; one record; one named field.</dd>
<dt>Schema</dt><dd>The design of the tables.</dd>
<dt>Primary key</dt><dd>Unique, not NULL identifier of a row.</dd>
<dt>Foreign key</dt><dd>A column that points at another table's key.</dd>
<dt>Constraint</dt><dd>A rule the database enforces: UNIQUE, NOT NULL and others.</dd>
<dt>Transaction</dt><dd>A group of changes that commit together or roll back together.</dd>
<dt>Cursor</dt><dd>The object that runs a statement and hands back rows.</dd>
<dt>Placeholder</dt><dd>The <code>?</code> or <code>:name</code> that stands for a value.</dd>
<dt>SQL injection</dt><dd>Input that changes the meaning of a query because it was pasted into the SQL text.</dd>
<dt>Join</dt><dd>Combining rows of two tables by a matching column.</dd>
<dt>Aggregate</dt><dd>A function over many rows: count, sum, min, max, avg.</dd>
<dt>Idempotent</dt><dd>Safe to run twice with the same result.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>SQLite is a library; the database is one file; no server and no password.</li>
<li><code>close()</code> does not commit. <code>with conn</code> commits or rolls back but does not close.</li>
<li>Python opens a transaction before INSERT, UPDATE and DELETE, not before SELECT.</li>
<li><code>fetchone()</code> returns a tuple or <code>None</code>; <code>fetchall()</code> returns a list.</li>
<li>Placeholders protect values, not table or column names.</li>
<li><code>= NULL</code> is never true; use <code>IS NULL</code>.</li>
<li>WHERE filters rows before grouping; HAVING filters groups after.</li>
<li>INSERT OR REPLACE swaps the whole row; omitted columns become NULL or default.</li>
<li>A relative database path depends on the folder you run from.</li>
<li><code>IntegrityError</code> is a broken constraint; <code>OperationalError</code> is a bad statement or name.</li>
</ul>

<h3>Command and code cheat-sheet</h3>
<pre class="code">sqlite3 inventory.db ".tables"
sqlite3 inventory.db ".schema"
sqlite3 -header -column inventory.db "SELECT * FROM devices"
sqlite3 -csv inventory.db "SELECT * FROM devices"
sqlite3 -header -column inventory.db "PRAGMA table_info(devices)"</pre>
<pre class="code">import sqlite3

conn = sqlite3.connect("inventory.db")
conn.row_factory = sqlite3.Row
try:
    with conn:
        conn.execute("INSERT OR REPLACE INTO devices VALUES (?, ?, ?, ?)", (name, ip, role, site))
    for r in conn.execute("SELECT name, ip FROM devices WHERE site = ? ORDER BY name", (site,)):
        print(r["name"], r["ip"])
finally:
    conn.close()</pre>
<table class="cmp"><tr><th>Task</th><th>SQL</th></tr>
<tr><td>Count per group</td><td><code>SELECT role, count(*) FROM devices GROUP BY role</code></td></tr>
<tr><td>Groups above a size</td><td><code>... GROUP BY site HAVING count(*) &gt; 1</code></td></tr>
<tr><td>Rows with no partner</td><td><code>FROM a LEFT JOIN b ON b.k = a.k WHERE b.k IS NULL</code></td></tr>
<tr><td>Recent rows</td><td><code>WHERE taken_at &gt;= datetime('now', '-1 day')</code></td></tr>
<tr><td>Safe re-run</td><td><code>CREATE TABLE IF NOT EXISTS</code>, <code>INSERT OR REPLACE</code></td></tr>
</table>

<div class="note"><p><b>About the lab simulator.</b> The lab <code>sqlite3</code> command takes one query per call, and no interactive prompt. It supports <code>-header</code>, <code>-column</code> and <code>-csv</code>, plus <code>.tables</code> and <code>.schema</code>. Enforcement of <code>CHECK</code> and foreign keys, <code>ALTER TABLE</code> and subqueries in a FROM clause are not part of this lab. On a real server all of these exist; check the SQLite documentation before relying on them.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reviewing the commands without running them. Skipping the outside check after a write. Putting passwords or tokens in the database as plain text. Committing <code>inventory.db</code> with real data into a public repository.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the options for "what is saved?" carefully. If there is no commit and no <code>with conn</code>, the answer is "nothing", even though a SELECT in the same script shows the new rows.</p></div>

<div class="scn"><h4>From CSV to a trusted source</h4><p>A team replaced a shared CSV with <code>inventory.db</code> and one loader script. Within a month the loader's duplicate protection caught two devices sharing one management IP, the facts join found 40 unpolled switches, and the nightly report finally matched reality.</p><p><b>Lesson:</b> a small database with constraints and joins finds problems a spreadsheet hides.</p></div>

<div class="iv"><p class="q">"Tell me about a time you used a database in network automation."</p><p>Describe the pipeline: devices in a table with a primary key, a collector that stores facts with timestamps using <code>INSERT OR REPLACE</code>, and a LEFT JOIN that lists devices without fresh facts. Mention placeholders, commit discipline and verifying from outside the script.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design with keys, load with placeholders, query with SELECT and joins.</li>
<li>Change data with a tested WHERE and a real commit.</li>
<li>Constraints and idempotent loads make scripts safe to rerun.</li>
<li>Verify the file from outside the script that wrote it.</li>
<li>Next in the track: Git, then Python with SSH to collect and configure many devices.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> interview, lab check ya asli change se pehle review ke liye ek page. Checklist padho, glossary aur most-tested facts par khud ko test karo, phir cheat-sheet apne keyboard ke paas rakho.</p>

<h3>Module ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Design, load, query, safely change, verify">
<rect x="5" y="40" width="118" height="60" rx="10" fill="#bae6fd"/><text x="64" y="64" text-anchor="middle" class="svg-ink" font-size="12">Design</text><text x="64" y="82" text-anchor="middle" class="svg-muted" font-size="10">tables, keys</text>
<rect x="132" y="40" width="118" height="60" rx="10" fill="#fde68a"/><text x="191" y="64" text-anchor="middle" class="svg-ink" font-size="12">Load</text><text x="191" y="82" text-anchor="middle" class="svg-muted" font-size="10">? aur executemany</text>
<rect x="259" y="40" width="118" height="60" rx="10" fill="#ddd6fe"/><text x="318" y="64" text-anchor="middle" class="svg-ink" font-size="12">Query</text><text x="318" y="82" text-anchor="middle" class="svg-muted" font-size="10">SELECT, JOIN</text>
<rect x="386" y="40" width="118" height="60" rx="10" fill="#bbf7d0"/><text x="445" y="64" text-anchor="middle" class="svg-ink" font-size="12">Safely badlo</text><text x="445" y="82" text-anchor="middle" class="svg-muted" font-size="10">WHERE, commit</text>
<rect x="513" y="40" width="122" height="60" rx="10" fill="#fed7aa"/><text x="574" y="64" text-anchor="middle" class="svg-ink" font-size="12">Verify</text><text x="574" y="82" text-anchor="middle" class="svg-muted" font-size="10">bahar se</text>
<line x1="123" y1="70" x2="132" y2="70" stroke="#64748b" stroke-width="2"/><line x1="250" y1="70" x2="259" y2="70" stroke="#64748b" stroke-width="2"/><line x1="377" y1="70" x2="386" y2="70" stroke="#64748b" stroke-width="2"/><line x1="504" y1="70" x2="513" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Database tool ka aadat-chakra.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main <code>CREATE TABLE</code>, primary key aur <code>NOT NULL</code> ke saath table bana sakta hoon, aur <code>.tables</code> aur <code>.schema</code> se list kar sakta hoon.</li>
<li>Main Python se connect, execute, <code>fetchone</code> aur <code>fetchall</code> se fetch, commit aur close kar sakta hoon.</li>
<li>Main <code>executemany</code> aur <code>?</code> placeholders se CSV load kar sakta hoon, aur bata sakta hoon ki f-strings khatarnak kyon hain.</li>
<li>Main <code>WHERE</code>, <code>ORDER BY</code>, <code>LIKE</code>, <code>IN</code>, <code>LIMIT</code> se filter, sort aur limit kar sakta hoon, aur <code>IS NULL</code> jaanta hoon.</li>
<li>Main WHERE ke saath <code>UPDATE</code> aur <code>DELETE</code> kar sakta hoon, <code>rowcount</code> check kar sakta hoon, aur <code>with conn</code> ya rollback use kar sakta hoon.</li>
<li>Main <code>UNIQUE</code>, <code>PRIMARY KEY</code>, <code>NOT NULL</code> samjha sakta hoon, aur seedha INSERT, OR IGNORE aur OR REPLACE ka fark bhi.</li>
<li>Main do tables join kar sakta hoon, <code>LEFT JOIN ... IS NULL</code> se missing rows dhoondh sakta hoon, aur <code>GROUP BY</code> aur <code>HAVING</code> se group kar sakta hoon.</li>
<li>Main <code>sqlite3.Row</code> use kar sakta hoon aur exit codes wala chhota CLI bana sakta hoon.</li>
<li>Main chaar classic bugs debug kar sakta hoon: string se bani SQL, column typo, gayab commit, duplicate key.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Table, row, column</dt><dd>Data ki grid; ek record; ek naam wala field.</dd>
<dt>Schema</dt><dd>Tables ka design.</dd>
<dt>Primary key</dt><dd>Row ka unique, not NULL pehchaanne wala.</dd>
<dt>Foreign key</dt><dd>Aisa column jo doosri table ki key ko point karta hai.</dd>
<dt>Constraint</dt><dd>Database ka lagu kiya niyam: UNIQUE, NOT NULL aur doosre.</dd>
<dt>Transaction</dt><dd>Changes ka group jo saath commit ya saath rollback hota hai.</dd>
<dt>Cursor</dt><dd>Woh object jo statement chalata hai aur rows wapas deta hai.</dd>
<dt>Placeholder</dt><dd>Woh <code>?</code> ya <code>:name</code> jo value ki jagah khada hota hai.</dd>
<dt>SQL injection</dt><dd>Aisa input jo query ka matlab badal deta hai kyunki woh SQL text mein paste hua.</dd>
<dt>Join</dt><dd>Do tables ki rows ko matching column se jodna.</dd>
<dt>Aggregate</dt><dd>Kai rows par function: count, sum, min, max, avg.</dd>
<dt>Idempotent</dt><dd>Do baar chalane par wahi result, safe.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>SQLite ek library hai; database ek file hai; koi server nahi, koi password nahi.</li>
<li><code>close()</code> commit nahi karta. <code>with conn</code> commit ya rollback karta hai par close nahi karta.</li>
<li>Python INSERT, UPDATE aur DELETE se pehle transaction kholta hai, SELECT se pehle nahi.</li>
<li><code>fetchone()</code> tuple ya <code>None</code> deta hai; <code>fetchall()</code> list deta hai.</li>
<li>Placeholders values ko bachate hain, table ya column naamon ko nahi.</li>
<li><code>= NULL</code> kabhi true nahi hota; <code>IS NULL</code> use karo.</li>
<li>WHERE grouping se pehle rows filter karta hai; HAVING baad mein groups.</li>
<li>INSERT OR REPLACE poori row badalta hai; chhode hue columns NULL ya default ban jaate hain.</li>
<li>Relative database path us folder par nirbhar hai jahan se aap chalate ho.</li>
<li><code>IntegrityError</code> toota hua constraint hai; <code>OperationalError</code> galat statement ya naam hai.</li>
</ul>

<h3>Command aur code cheat-sheet</h3>
<pre class="code">sqlite3 inventory.db ".tables"
sqlite3 inventory.db ".schema"
sqlite3 -header -column inventory.db "SELECT * FROM devices"
sqlite3 -csv inventory.db "SELECT * FROM devices"
sqlite3 -header -column inventory.db "PRAGMA table_info(devices)"</pre>
<pre class="code">import sqlite3

conn = sqlite3.connect("inventory.db")
conn.row_factory = sqlite3.Row
try:
    with conn:
        conn.execute("INSERT OR REPLACE INTO devices VALUES (?, ?, ?, ?)", (name, ip, role, site))
    for r in conn.execute("SELECT name, ip FROM devices WHERE site = ? ORDER BY name", (site,)):
        print(r["name"], r["ip"])
finally:
    conn.close()</pre>
<table class="cmp"><tr><th>Kaam</th><th>SQL</th></tr>
<tr><td>Group ke hisaab se count</td><td><code>SELECT role, count(*) FROM devices GROUP BY role</code></td></tr>
<tr><td>Ek size se bade groups</td><td><code>... GROUP BY site HAVING count(*) &gt; 1</code></td></tr>
<tr><td>Bina partner wali rows</td><td><code>FROM a LEFT JOIN b ON b.k = a.k WHERE b.k IS NULL</code></td></tr>
<tr><td>Taaza rows</td><td><code>WHERE taken_at &gt;= datetime('now', '-1 day')</code></td></tr>
<tr><td>Safe re-run</td><td><code>CREATE TABLE IF NOT EXISTS</code>, <code>INSERT OR REPLACE</code></td></tr>
</table>

<div class="note"><p><b>Lab simulator ke baare mein.</b> Lab ka <code>sqlite3</code> command ek call mein ek query leta hai, aur interactive prompt nahi hai. Yeh <code>-header</code>, <code>-column</code> aur <code>-csv</code>, saath mein <code>.tables</code> aur <code>.schema</code> support karta hai. <code>CHECK</code> aur foreign keys ka enforcement, <code>ALTER TABLE</code> aur FROM clause mein subqueries is lab ka hissa nahi hain. Asli server par yeh sab maujood hain; bharosa karne se pehle SQLite documentation dekho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Commands ko chalaye bina review karna. Write ke baad bahar ki check chhodna. Passwords ya tokens ko database mein plain text rakhna. Asli data wali <code>inventory.db</code> ko public repository mein commit karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Kya save hua?" wale options dhyan se padho. Commit nahi aur <code>with conn</code> nahi, to jawab "kuch nahi" hai, chahe usi script ka SELECT nayi rows dikhaye.</p></div>

<div class="scn"><h4>CSV se bharosemand source tak</h4><p>Ek team ne shared CSV ki jagah <code>inventory.db</code> aur ek loader script rakhi. Ek mahine mein loader ki duplicate protection ne ek hi management IP share karte do devices pakde, facts join ne 40 bina-poll switches dhoondhe, aur nightly report aakhir mein haqeeqat se mil gayi.</p><p><b>Lesson:</b> constraints aur joins wala chhota database woh problems dhoondhta hai jo spreadsheet chhupa leti hai.</p></div>

<div class="iv"><p class="q">"Network automation mein database use karne ka koi anubhav batao."</p><p>Pipeline batao: primary key wali table mein devices, <code>INSERT OR REPLACE</code> se timestamps ke saath facts store karne wala collector, aur LEFT JOIN jo bina taaze facts wale devices list karta hai. Placeholders, commit discipline aur script ke bahar se verify karna zaroor kaho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keys ke saath design, placeholders ke saath load, SELECT aur joins se query.</li>
<li>Test kiye WHERE aur asli commit ke saath data badlo.</li>
<li>Constraints aur idempotent loads scripts ko dobara chalane layak banate hain.</li>
<li>File ko us script ke bahar se verify karo jisne likhi.</li>
<li>Track mein agla: Git, phir SSH ke saath Python se kai devices collect aur configure karna.</li>
</ul></div>
`}};export{e as default};