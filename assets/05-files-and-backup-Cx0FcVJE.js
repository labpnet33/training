var e={id:`files-backup`,h:{en:`Saving results to files: the backup script`,hi:`Results ko files mein save karna: backup script`},body:{en:`

<p>The most useful first automation in any network is a <b>configuration backup</b>. It uses only what you know (login, send a command) plus one new idea: <b>writing text into a file</b>.</p>

<h3>Files in Python: open, mode, write</h3>
<p>A file is a named piece of text on the AUTO host. To use it, Python needs two things: the file name and the <b>mode</b>, which says what you plan to do.</p>
<table class="cmp"><tr><th>Mode</th><th>Meaning</th><th>If the file does not exist</th></tr>
<tr><td><code>"r"</code></td><td>read only (the default)</td><td>error: FileNotFoundError</td></tr>
<tr><td><code>"w"</code></td><td>write; empties the file first</td><td>creates it</td></tr>
<tr><td><code>"a"</code></td><td>append at the end</td><td>creates it</td></tr></table>
<p>The safe pattern uses <code>with</code>. It opens the file, gives it a short name (<code>f</code>), and <b>closes it automatically</b> when the indented block ends, even if an error happens inside:</p>
<pre class="code">with open("R1.cfg", "w") as f:     # open for writing, call it f
    f.write(config)                # put the text inside
# leaving the indented block closes the file</pre>

<h3>The classic mistake: the wrong mode</h3>
<p>If you open a file that does not exist with mode <code>"r"</code>, Python tells you at once:</p>
<pre class="code">with open("R9.cfg", "r") as f:
    text = f.read()</pre>
<pre class="out">AUTO&gt; python3 readmode.py
Traceback (most recent call last):
  File "readmode.py", line 1, in &lt;module&gt;
    with open("R9.cfg", "r") as f:
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'R9.cfg'</span></pre>
<p>This is exactly the bug in the Lab 1 starter script: it uses <code>"r"</code> where it needs <code>"w"</code>. Reading a file that was never created is impossible, so the fix is the mode, not the file.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="The backup script reads each router over SSH and writes the text into one file per router."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="110" height="70" rx="10" fill="#ddd6fe"/><text x="65" y="92" text-anchor="middle" class="svg-ink" font-size="14">AUTO</text><text x="65" y="110" text-anchor="middle" class="svg-muted" font-size="12">backup.py</text><rect x="190" y="20" width="150" height="46" rx="10" fill="#bae6fd"/><text x="265" y="40" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="265" y="58" text-anchor="middle" class="svg-muted" font-size="12">show running-config</text><rect x="190" y="72" width="150" height="46" rx="10" fill="#bae6fd"/><text x="265" y="92" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="265" y="110" text-anchor="middle" class="svg-muted" font-size="12">show running-config</text><rect x="190" y="124" width="150" height="46" rx="10" fill="#bae6fd"/><text x="265" y="144" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="265" y="162" text-anchor="middle" class="svg-muted" font-size="12">show running-config</text><line x1="120" y1="85" x2="190" y2="43" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="120" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="120" y1="105" x2="190" y2="147" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="450" y="20" width="170" height="46" rx="10" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="14">R1.cfg</text><rect x="450" y="72" width="170" height="46" rx="10" fill="#bbf7d0"/><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="14">R2.cfg</text><rect x="450" y="124" width="170" height="46" rx="10" fill="#bbf7d0"/><text x="535" y="152" text-anchor="middle" class="svg-ink" font-size="14">R3.cfg</text><line x1="340" y1="43" x2="450" y2="43" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="340" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="340" y1="147" x2="450" y2="147" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">The backup script reads each router over SSH and writes the text into one file per router.</p></div>

<h3>The complete backup script</h3>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    name = conn.find_prompt().rstrip("#&gt;")
    config = conn.send_command("show running-config")
    conn.disconnect()
    with open(name + ".cfg", "w") as f:
        f.write(config)
    print("Backed up", name, "-&gt;", name + ".cfg")</pre>
<ul>
<li><code>conn.find_prompt().rstrip("#&gt;")</code> gives the router name: <code>R1#</code> becomes <code>R1</code>. We use it to name the file, so no name is typed by hand.</li>
<li><code>config = conn.send_command("show running-config")</code>: the whole configuration as one string.</li>
<li><code>conn.disconnect()</code> comes <b>before</b> writing the file. The session is no longer needed, so we release the vty line early.</li>
<li><code>name + ".cfg"</code> joins two strings with <code>+</code>. <code>"R1" + ".cfg"</code> is <code>"R1.cfg"</code>.</li>
<li><code>f.write(config)</code> writes the text into the file.</li>
</ul>
<p>Run it (all three routers accept SSH at this point):</p>
<pre class="out">AUTO&gt; python3 backup.py
Backed up R1 -&gt; R1.cfg
Backed up R2 -&gt; R2.cfg
<span class="hl">Backed up R3 -&gt; R3.cfg</span></pre>

<h3>Never trust a script blindly: look at the file</h3>
<p>The script printed "Backed up", but that only proves it reached the last line. Open a file yourself. Two quick ways: <code>grep hostname R3.cfg</code> on the host, or a few lines of Python that count lines and print the first twelve:</p>
<pre class="code">with open("R3.cfg") as f:
    text = f.read()
lines = text.splitlines()
print("lines in file:", len(lines))
for line in lines[:12]:
    print(line)</pre>
<pre class="out">AUTO&gt; python3 peek.py
lines in file: 52
Building configuration...

Current configuration : 852 bytes
!
version 2.0
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
<span class="hl">hostname R3</span>
!
boot-start-marker</pre>
<pre class="out"><span class="hl">AUTO&gt; grep hostname R3.cfg</span>
<span class="hl">hostname R3</span></pre>
<p>Each file starts with the lines <code>Building configuration...</code> and <code>Current configuration</code>, which belong to the command output, not the configuration itself. That is normal for a backup; just remember it if you later compare two backups with a tool.</p>

<h3>A better file name: add the date</h3>
<p>One file per router overwrites yesterday's backup. Adding the date keeps history. The <code>datetime</code> module (part of Python) gives the date, and <code>strftime("%Y-%m-%d")</code> formats it as year-month-day:</p>
<pre class="code">from datetime import datetime

stamp = datetime.now().strftime("%Y-%m-%d")
name = "R1"
filename = name + "_" + stamp + ".cfg"
print(filename)

with open("notes.txt", "a") as f:
    f.write("first line\\n")
with open("notes.txt", "a") as f:
    f.write("second line\\n")
print(open("notes.txt").read())</pre>
<pre class="out">AUTO&gt; python3 stamp.py
<span class="hl">R1_2026-09-29.cfg</span>
first line
second line</pre>
<p>The date printed is the lab clock's date, so you will see today's lab date. The second half of the script shows mode <code>"a"</code>: two separate <code>with</code> blocks both added a line, and neither erased the other.</p>

<div class="eg"><p><b>Worked example.</b> A company wants 30 days of history for 3 routers. Each night the script writes 3 files named like <code>R1_2026-09-29.cfg</code>. After 30 days there are 90 small files. To see what changed, an engineer compares last night's file with the one from a week ago. If a router is replaced, its last backup is the recovery source.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Mode <code>"w"</code> silently erases an existing file; a typo in the file name overwrites the wrong backup. (2) Forgetting that <code>"r"</code> cannot create a file. (3) Backups contain secrets (hashed passwords, SNMP strings, keys). Store them in a protected folder, never in a public repository.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the three modes: <code>r</code> reads, <code>w</code> overwrites, <code>a</code> appends. The <code>with</code> statement closes the file automatically. A config <i>backup</i> is a read-only task on the router: it uses <code>send_command</code>, not <code>send_config_set</code>.</p></div>

<div class="scn"><h4>The backup that was one byte long</h4><p>A team's backup folder looked fine, with 40 files from last night. During a recovery they opened the file for the failed router: it was empty. A script had opened the file with <code>"w"</code>, the router had timed out, and the empty file stayed. The fix was to open the file only <i>after</i> a successful <code>send_command</code>, and to check that the text was not empty before saving.</p><p><b>Lesson:</b> a file that exists is not a good backup. Check the content.</p></div>

<div class="iv"><p class="q">"How would you automate nightly configuration backups?"</p><p>A script loops over the device inventory, connects over SSH, runs <code>show running-config</code>, and writes the text to a file named with the hostname and date. It handles unreachable devices, checks that the output is not empty, stores backups in a protected location with version control, and is started by a scheduler. Add that you would test a restore, because an untested backup is only a hope.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>open(name, mode)</code>: <code>"r"</code> read, <code>"w"</code> write (overwrite), <code>"a"</code> append.</li>
<li><code>with open(...) as f:</code> closes the file for you.</li>
<li><code>name + ".cfg"</code> builds a file name; <code>f.write(text)</code> puts text into the file.</li>
<li>Open the saved file yourself to verify the backup; a printed message is not proof.</li>
<li>Backups contain sensitive data; protect them.</li>
</ul></div>

`,hi:`

<p>Kisi bhi network ka sabse kaam ka pehla automation hai <b>configuration backup</b>. Isme sirf wahi cheezein lagti hain jo aap jaante ho (login, command bhejna) aur ek naya idea: <b>text ko file mein likhna</b>.</p>

<h3>Python mein files: open, mode, write</h3>
<p>File AUTO host par ek naam wala text ka tukda hai. Use karne ke liye Python ko do cheezein chahiye: file ka naam aur <b>mode</b>, jo batata hai ki aap kya karne wale ho.</p>
<table class="cmp"><tr><th>Mode</th><th>Matlab</th><th>File exist na kare to</th></tr>
<tr><td><code>"r"</code></td><td>sirf read (default)</td><td>error: FileNotFoundError</td></tr>
<tr><td><code>"w"</code></td><td>write; pehle file khaali karta hai</td><td>bana deta hai</td></tr>
<tr><td><code>"a"</code></td><td>end mein append</td><td>bana deta hai</td></tr></table>
<p>Safe pattern <code>with</code> use karta hai. Yeh file kholta hai, use chhota naam (<code>f</code>) deta hai, aur indented block khatam hote hi file ko <b>apne aap band kar deta hai</b>, andar error aaye tab bhi:</p>
<pre class="code">with open("R1.cfg", "w") as f:     # writing ke liye kholo, naam f
    f.write(config)                # text andar daalo
# indented block se bahar aate hi file band ho jaati hai</pre>

<h3>Classic galti: galat mode</h3>
<p>Agar aap aisi file ko mode <code>"r"</code> se kholte ho jo exist nahi karti, to Python turant batata hai:</p>
<pre class="code">with open("R9.cfg", "r") as f:
    text = f.read()</pre>
<pre class="out">AUTO&gt; python3 readmode.py
Traceback (most recent call last):
  File "readmode.py", line 1, in &lt;module&gt;
    with open("R9.cfg", "r") as f:
<span class="hl">FileNotFoundError: [Errno 2] No such file or directory: 'R9.cfg'</span></pre>
<p>Lab 1 ki starter script mein yahi bug hai: jahan <code>"w"</code> chahiye wahan <code>"r"</code> hai. Jo file kabhi bani hi nahi use padhna namumkin hai, isliye fix mode hai, file nahi.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Backup script har router ko SSH se padhti hai aur text ko har router ki ek file mein likhti hai."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="110" height="70" rx="10" fill="#ddd6fe"/><text x="65" y="92" text-anchor="middle" class="svg-ink" font-size="14">AUTO</text><text x="65" y="110" text-anchor="middle" class="svg-muted" font-size="12">backup.py</text><rect x="190" y="20" width="150" height="46" rx="10" fill="#bae6fd"/><text x="265" y="40" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="265" y="58" text-anchor="middle" class="svg-muted" font-size="12">show running-config</text><rect x="190" y="72" width="150" height="46" rx="10" fill="#bae6fd"/><text x="265" y="92" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="265" y="110" text-anchor="middle" class="svg-muted" font-size="12">show running-config</text><rect x="190" y="124" width="150" height="46" rx="10" fill="#bae6fd"/><text x="265" y="144" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="265" y="162" text-anchor="middle" class="svg-muted" font-size="12">show running-config</text><line x1="120" y1="85" x2="190" y2="43" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="120" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="120" y1="105" x2="190" y2="147" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><rect x="450" y="20" width="170" height="46" rx="10" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="14">R1.cfg</text><rect x="450" y="72" width="170" height="46" rx="10" fill="#bbf7d0"/><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="14">R2.cfg</text><rect x="450" y="124" width="170" height="46" rx="10" fill="#bbf7d0"/><text x="535" y="152" text-anchor="middle" class="svg-ink" font-size="14">R3.cfg</text><line x1="340" y1="43" x2="450" y2="43" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="340" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="340" y1="147" x2="450" y2="147" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">Backup script har router ko SSH se padhti hai aur text ko har router ki ek file mein likhti hai.</p></div>

<h3>Poori backup script</h3>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]

for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    name = conn.find_prompt().rstrip("#&gt;")
    config = conn.send_command("show running-config")
    conn.disconnect()
    with open(name + ".cfg", "w") as f:
        f.write(config)
    print("Backed up", name, "-&gt;", name + ".cfg")</pre>
<ul>
<li><code>conn.find_prompt().rstrip("#&gt;")</code> router ka naam deta hai: <code>R1#</code> se <code>R1</code>. Hum use file ka naam rakhne ke liye use karte hain, isliye naam haath se type nahi hota.</li>
<li><code>config = conn.send_command("show running-config")</code>: poori configuration ek string ke roop mein.</li>
<li><code>conn.disconnect()</code> file likhne se <b>pehle</b> aata hai. Session ab zaroori nahi, isliye vty line jaldi chhod dete hain.</li>
<li><code>name + ".cfg"</code> do strings ko <code>+</code> se jodta hai. <code>"R1" + ".cfg"</code> ka matlab <code>"R1.cfg"</code>.</li>
<li><code>f.write(config)</code> text ko file mein likhta hai.</li>
</ul>
<p>Chalao (is waqt teeno routers SSH accept karte hain):</p>
<pre class="out">AUTO&gt; python3 backup.py
Backed up R1 -&gt; R1.cfg
Backed up R2 -&gt; R2.cfg
<span class="hl">Backed up R3 -&gt; R3.cfg</span></pre>

<h3>Script par aankh band karke bharosa mat karo: file dekho</h3>
<p>Script ne "Backed up" print kiya, par isse sirf yeh saabit hota hai ki woh aakhri line tak pahunchi. Ek file khud kholo. Do tez tareeke: host par <code>grep hostname R3.cfg</code>, ya Python ki kuch lines jo lines gino aur pehli barah print karo:</p>
<pre class="code">with open("R3.cfg") as f:
    text = f.read()
lines = text.splitlines()
print("lines in file:", len(lines))
for line in lines[:12]:
    print(line)</pre>
<pre class="out">AUTO&gt; python3 peek.py
lines in file: 52
Building configuration...

Current configuration : 852 bytes
!
version 2.0
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
<span class="hl">hostname R3</span>
!
boot-start-marker</pre>
<pre class="out"><span class="hl">AUTO&gt; grep hostname R3.cfg</span>
<span class="hl">hostname R3</span></pre>
<p>Har file <code>Building configuration...</code> aur <code>Current configuration</code> lines se shuru hoti hai, jo command output ka hissa hain, configuration ka nahi. Backup mein yeh normal hai; bas yaad rakho agar baad mein kisi tool se do backups compare karo.</p>

<h3>Behtar file naam: date jodo</h3>
<p>Router ki ek hi file kal ka backup overwrite kar deti hai. Date jodne se history bachti hai. <code>datetime</code> module (Python ka hissa) date deta hai, aur <code>strftime("%Y-%m-%d")</code> use saal-mahina-din format mein badalta hai:</p>
<pre class="code">from datetime import datetime

stamp = datetime.now().strftime("%Y-%m-%d")
name = "R1"
filename = name + "_" + stamp + ".cfg"
print(filename)

with open("notes.txt", "a") as f:
    f.write("first line\\n")
with open("notes.txt", "a") as f:
    f.write("second line\\n")
print(open("notes.txt").read())</pre>
<pre class="out">AUTO&gt; python3 stamp.py
<span class="hl">R1_2026-09-29.cfg</span>
first line
second line</pre>
<p>Jo date print hui woh lab clock ki date hai, isliye aapko lab ki aaj ki date dikhegi. Script ka doosra hissa mode <code>"a"</code> dikhata hai: do alag <code>with</code> blocks ne ek-ek line jodi, aur kisi ne doosre ko erase nahi kiya.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ko 3 routers ki 30 din ki history chahiye. Har raat script 3 files likhti hai jaise <code>R1_2026-09-29.cfg</code>. 30 din baad 90 chhoti files hoti hain. Kya badla yeh dekhne ke liye engineer kal raat ki file ko hafte bhar purani file se compare karta hai. Agar router badla jaaye to uska aakhri backup recovery source hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Mode <code>"w"</code> maujooda file ko chupchaap erase kar deta hai; file naam mein typo galat backup ko overwrite kar deta hai. (2) Bhool jaana ki <code>"r"</code> file bana nahi sakta. (3) Backups mein secrets hote hain (hashed passwords, SNMP strings, keys). Unhe protected folder mein rakho, public repository mein kabhi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen modes jaano: <code>r</code> padhta hai, <code>w</code> overwrite karta hai, <code>a</code> append karta hai. <code>with</code> statement file ko apne aap band karta hai. Config <i>backup</i> router par read-only kaam hai: woh <code>send_command</code> use karta hai, <code>send_config_set</code> nahi.</p></div>

<div class="scn"><h4>Woh backup jo ek byte ka tha</h4><p>Ek team ka backup folder theek dikhta tha, kal raat ki 40 files ke saath. Recovery ke dauran unhone failed router ki file kholi: woh khaali thi. Script ne file <code>"w"</code> se kholi thi, router timeout ho gaya, aur khaali file reh gayi. Fix yeh tha ki file sirf kamyab <code>send_command</code> ke <i>baad</i> kholi jaaye, aur save karne se pehle check ho ki text khaali nahi hai.</p><p><b>Lesson:</b> jo file maujood hai woh achha backup nahi hai. Content check karo.</p></div>

<div class="iv"><p class="q">"Nightly configuration backups kaise automate karoge?"</p><p>Ek script device inventory par loop chalati hai, SSH se connect karti hai, <code>show running-config</code> chalati hai, aur text ko hostname aur date wale naam ki file mein likhti hai. Woh unreachable devices handle karti hai, check karti hai ki output khaali nahi hai, backups ko version control ke saath protected jagah rakhti hai, aur scheduler se start hoti hai. Jodo ki aap restore test karoge, kyunki bina test ka backup sirf ek umeed hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>open(name, mode)</code>: <code>"r"</code> read, <code>"w"</code> write (overwrite), <code>"a"</code> append.</li>
<li><code>with open(...) as f:</code> file ko aapke liye band karta hai.</li>
<li><code>name + ".cfg"</code> file ka naam banata hai; <code>f.write(text)</code> text ko file mein daalta hai.</li>
<li>Backup verify karne ke liye saved file khud kholo; print kiya hua message saboot nahi hai.</li>
<li>Backups mein sensitive data hota hai; unhe protect karo.</li>
</ul></div>

`}};export{e as default};