var e={id:`modules-files-exceptions`,h:{en:`Modules, files and exceptions`,hi:`Modules, files aur exceptions`},body:{en:`
<p>A carpenter does not forge his own hammer before building a table; he takes it from the toolbox. Python works the same way: thousands of ready tools live in <b>modules</b> that you <b>import</b>. The carpenter also keeps a notebook of measurements (<b>files</b>), and wears safety glasses because things go wrong (<b>exceptions</b>). This chapter covers all three, because every real network script uses them.</p>

<h3>Modules and import</h3>
<p>A <b>module</b> is simply a Python file whose functions and values you can reuse. A <b>package</b> is a folder of modules. Python ships with a large <b>standard library</b> (no installation needed); other packages, such as Netmiko or requests, are installed with pip.</p>
<pre class="code">import json                          <span class="c"># whole module: use json.loads(...)</span>
import re                            <span class="c"># regular expressions</span>
from getpass import getpass          <span class="c"># one name: use getpass(...) directly</span>
from nkmiko import ConnectHandler    <span class="c"># the lab's netmiko-style library</span>
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException
import ipaddress as ip               <span class="c"># give the module a short alias</span></pre>
<table class="cmp"><tr><th>Standard module</th><th>Typical network use</th></tr>
<tr><td><code>json</code></td><td>Read and write JSON from APIs and files</td></tr>
<tr><td><code>re</code></td><td>Find patterns in CLI output</td></tr>
<tr><td><code>os</code>, <code>sys</code></td><td>Environment variables, paths, script arguments, exit codes</td></tr>
<tr><td><code>ipaddress</code></td><td>Validate addresses, compute subnets and hosts</td></tr>
<tr><td><code>csv</code>, <code>datetime</code>, <code>time</code>, <code>logging</code></td><td>Inventories, timestamps, pauses, log files</td></tr>
<tr><td><code>getpass</code></td><td>Ask for a password without showing it on screen</td></tr>
</table>
<p>If an import fails you see <code>ModuleNotFoundError: No module named 'netmiko'</code>: the package is not installed in the Python (or venv) you are running. You will also see scripts end with <code>if __name__ == "__main__":</code> followed by an indented call such as <code>main()</code>. That block runs only when the file is executed directly, not when another script imports it.</p>

<h3>Reading and writing files</h3>
<p><code>open(name, mode)</code> opens a file. Mode <code>"r"</code> reads (the default), <code>"w"</code> writes and <b>erases</b> any existing content, <code>"a"</code> appends to the end. Always use it with <code>with</code>: the file is closed automatically when the block ends, even if an error happens inside.</p>
<pre class="code">with open("devices.txt") as f:          <span class="c"># read: one IP per line</span>
    ips = [line.strip() for line in f if line.strip()]

with open("R1.cfg", "w") as f:          <span class="c"># write: text only, add newlines yourself</span>
    f.write("hostname R1&#92;n")
    f.write("interface Loopback100&#92;n")</pre>
<p><code>f.read()</code> returns the whole file as one string, and looping over <code>f</code> gives one line at a time, each still ending in a newline, which is why <code>.strip()</code> appears so often. <code>write()</code> accepts only strings; write numbers with <code>str()</code> or <code>.format()</code>.</p>

<h3>Exceptions: when something goes wrong</h3>
<p>An <b>exception</b> is Python's way of saying "I cannot continue". If nothing handles it, the script stops and prints a <b>traceback</b>. Read a traceback from the <b>bottom</b>: the last line names the exception type and message; the lines above show the file, line number and code where it happened. This is what the lab script prints when the password is wrong:</p>
<pre class="out">Traceback (most recent call last):
  File "collect.py", line 24, in &lt;module&gt;
    conn = ConnectHandler(host=ip, **CREDS)
<span class="hl">nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.</span>

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

Device settings: nk_ios 10.99.0.1:22</pre>
<table class="cmp"><tr><th>Exception</th><th>Typical cause</th></tr>
<tr><td><code>SyntaxError: expected ':'</code></td><td>Missing colon after if, for, def; nothing ran</td></tr>
<tr><td><code>IndentationError</code></td><td>Block not indented, or indented inconsistently</td></tr>
<tr><td><code>NameError</code></td><td>Typo in a name, or used before it was assigned</td></tr>
<tr><td><code>TypeError</code></td><td>Wrong type, such as str + int</td></tr>
<tr><td><code>KeyError</code> / <code>IndexError</code></td><td>Missing dict key / list position does not exist</td></tr>
<tr><td><code>FileNotFoundError</code></td><td>Wrong file name or folder</td></tr>
<tr><td><code>JSONDecodeError</code></td><td>Invalid JSON text</td></tr>
<tr><td><code>NetmikoTimeoutException</code></td><td>No TCP session to port 22: routing, ACL, SSH off</td></tr>
<tr><td><code>NetmikoAuthenticationException</code></td><td>TCP worked, login refused: user or password</td></tr>
</table>

<h3>Handling exceptions with try and except</h3>
<p>Put risky code in a <code>try</code> block and say what to do in <code>except</code>. Catch the <b>specific</b> exceptions you expect, so real bugs still show up. <code>else</code> runs only if no exception happened; <code>finally</code> always runs.</p>
<pre class="code">failed = []
for ip in ips:
    try:
        conn = ConnectHandler(host=ip, **CREDS)
    except NetmikoTimeoutException:
        failed.append(ip + " unreachable")
        continue
    except NetmikoAuthenticationException:
        failed.append(ip + " login refused")
        continue
    else:
        print(conn.send_command("show version | include uptime"))
        conn.disconnect()
print("Failed:", failed)</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="try except flow">
<rect x="20" y="60" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="13">try: connect</text>
<rect x="240" y="10" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="325" y="37" text-anchor="middle" class="svg-ink" font-size="13">else: collect output</text>
<rect x="240" y="112" width="170" height="44" rx="8" fill="#fed7aa"/><text x="325" y="139" text-anchor="middle" class="svg-ink" font-size="13">except: log, continue</text>
<rect x="480" y="60" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="90" text-anchor="middle" class="svg-ink" font-size="13">next device</text>
<line x1="150" y1="78" x2="240" y2="32" stroke="#64748b" stroke-width="2"/><text x="175" y="45" class="svg-accent" font-size="12">no error</text>
<line x1="150" y1="92" x2="240" y2="134" stroke="#64748b" stroke-width="2"/><text x="170" y="135" class="svg-accent" font-size="12">exception</text>
<line x1="410" y1="32" x2="480" y2="78" stroke="#64748b" stroke-width="2"/><line x1="410" y1="134" x2="480" y2="92" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One bad device is logged and skipped; the run continues.</p></div>

<div class="eg"><p><b>Worked example.</b> 300 devices, 4 of them powered off. Without try/except the backup stops at the first dead device, say number 12, and 288 devices get no backup. With the loop above, 296 devices are backed up and the <code>failed</code> list names exactly the 4 to chase. Same code length, completely different night.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A bare <code>except:</code> that catches everything, including your own typos and Ctrl+C, and hides them; opening a report with <code>"w"</code> inside the loop, so each device overwrites the previous one (open it once before the loop, or use <code>"a"</code>); and hard-coding real passwords in the script instead of using <code>getpass()</code> or environment variables via <code>os.environ</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read tracebacks from the bottom line up. A timeout means the TCP session never formed (reachability, ACL, SSH disabled, wrong port); an authentication exception means TCP worked and the credentials were refused. <code>with open(...)</code> closes the file automatically.</p></div>

<div class="scn"><h4>The backup that stopped at device 12</h4><p>A nightly configuration backup covered 300 routers. One morning the team found backups for only 11. Router 12 had been powered off for a site move, the script raised <code>NetmikoTimeoutException</code>, and because nothing caught it the whole run ended. The engineer wrapped the connection in try/except for the two Netmiko exceptions, added the failing host to a list, used <code>continue</code>, and emailed the list at the end. The next night 299 backups succeeded and the report named the one router being moved.</p><p><b>Lesson:</b> in a loop over many devices, one failure must be logged and skipped, never allowed to stop the run.</p></div>

<div class="iv"><p class="q">"Your script touches 500 devices. How do you deal with devices that are down or reject the login?"</p><p>Strong answer: wrap each connection in try/except catching the specific timeout and authentication exceptions, record the host and reason, <code>continue</code> to the next device, and print or send a summary at the end. Do not use a bare except. Mention setting a sensible connection timeout, logging with timestamps, and for changes, stopping (<code>break</code>) if verification fails rather than skipping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>import module</code> or <code>from module import name</code>; standard library needs no install, others come from pip.</li>
<li><code>with open(file, mode)</code>: "r" read, "w" overwrite, "a" append; the file closes automatically.</li>
<li>Read a traceback bottom-up: exception type and message last, file and line above.</li>
<li>try/except/else/finally; catch specific exceptions, never a bare except.</li>
<li>Timeout = no TCP session; authentication exception = wrong credentials.</li>
</ul></div>
`,hi:`
<p>Ek carpenter table banane se pehle apna hathoda khud nahi banata; woh toolbox se nikaalta hai. Python bhi aise hi kaam karta hai: hazaaron taiyaar tools <b>modules</b> mein rehte hain jinhe aap <b>import</b> karte ho. Carpenter measurements ki ek notebook (<b>files</b>) bhi rakhta hai, aur safety glasses pehenta hai kyunki cheezein galat hoti hain (<b>exceptions</b>). Yeh chapter teeno cover karta hai, kyunki har asli network script inhe use karta hai.</p>

<h3>Modules aur import</h3>
<p><b>Module</b> bas ek Python file hai jiske functions aur values aap dobara use kar sakte ho. <b>Package</b> modules ka folder hai. Python ek bada <b>standard library</b> saath laata hai (install ki zaroorat nahi); doosre packages, jaise Netmiko ya requests, pip se install hote hain.</p>
<pre class="code">import json                          <span class="c"># poora module: json.loads(...) use karo</span>
import re                            <span class="c"># regular expressions</span>
from getpass import getpass          <span class="c"># ek naam: getpass(...) seedha use karo</span>
from nkmiko import ConnectHandler    <span class="c"># lab ki netmiko jaisi library</span>
from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException
import ipaddress as ip               <span class="c"># module ko chhota alias do</span></pre>
<table class="cmp"><tr><th>Standard module</th><th>Typical network use</th></tr>
<tr><td><code>json</code></td><td>APIs aur files se JSON padhna aur likhna</td></tr>
<tr><td><code>re</code></td><td>CLI output mein patterns dhoondhna</td></tr>
<tr><td><code>os</code>, <code>sys</code></td><td>Environment variables, paths, script arguments, exit codes</td></tr>
<tr><td><code>ipaddress</code></td><td>Addresses validate karna, subnets aur hosts nikaalna</td></tr>
<tr><td><code>csv</code>, <code>datetime</code>, <code>time</code>, <code>logging</code></td><td>Inventories, timestamps, pauses, log files</td></tr>
<tr><td><code>getpass</code></td><td>Password screen par dikhaye bina poochna</td></tr>
</table>
<p>Import fail ho to aapko <code>ModuleNotFoundError: No module named 'netmiko'</code> dikhta hai: package us Python (ya venv) mein install nahi hai jo aap chala rahe ho. Aap scripts ko <code>if __name__ == "__main__":</code> ke saath khatam hote bhi dekhoge, jiske baad <code>main()</code> jaisa indented call hota hai. Woh block sirf tab chalta hai jab file seedhe execute ho, tab nahi jab koi doosra script use import kare.</p>

<h3>Files padhna aur likhna</h3>
<p><code>open(name, mode)</code> file kholta hai. Mode <code>"r"</code> padhta hai (default), <code>"w"</code> likhta hai aur maujooda content <b>mita deta</b> hai, <code>"a"</code> end mein jodta hai. Hamesha <code>with</code> ke saath use karo: block khatam hote hi file automatically band ho jaati hai, chahe andar error ho jaaye.</p>
<pre class="code">with open("devices.txt") as f:          <span class="c"># padho: har line par ek IP</span>
    ips = [line.strip() for line in f if line.strip()]

with open("R1.cfg", "w") as f:          <span class="c"># likho: sirf text, newlines khud jodo</span>
    f.write("hostname R1&#92;n")
    f.write("interface Loopback100&#92;n")</pre>
<p><code>f.read()</code> poori file ek string ki tarah deta hai, aur <code>f</code> par loop ek baar mein ek line deta hai, har line abhi bhi newline par khatam, isliye <code>.strip()</code> itni baar dikhta hai. <code>write()</code> sirf strings leta hai; numbers <code>str()</code> ya <code>.format()</code> se likho.</p>

<h3>Exceptions: jab kuch galat ho</h3>
<p><b>Exception</b> Python ka kehne ka tarika hai "main aage nahi badh sakta". Agar koi use handle na kare, to script ruk jaata hai aur <b>traceback</b> print karta hai. Traceback ko <b>neeche se</b> padho: aakhri line exception type aur message batati hai; upar ki lines file, line number aur woh code dikhati hain jahan yeh hua. Password galat hone par lab script yeh print karta hai:</p>
<pre class="out">Traceback (most recent call last):
  File "collect.py", line 24, in &lt;module&gt;
    conn = ConnectHandler(host=ip, **CREDS)
<span class="hl">nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.</span>

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

Device settings: nk_ios 10.99.0.1:22</pre>
<table class="cmp"><tr><th>Exception</th><th>Aam wajah</th></tr>
<tr><td><code>SyntaxError: expected ':'</code></td><td>if, for, def ke baad colon missing; kuch nahi chala</td></tr>
<tr><td><code>IndentationError</code></td><td>Block indent nahi hua, ya inconsistent indent</td></tr>
<tr><td><code>NameError</code></td><td>Naam mein typo, ya assign se pehle use</td></tr>
<tr><td><code>TypeError</code></td><td>Galat type, jaise str + int</td></tr>
<tr><td><code>KeyError</code> / <code>IndexError</code></td><td>Dict key missing / list position exist nahi karti</td></tr>
<tr><td><code>FileNotFoundError</code></td><td>Galat file naam ya folder</td></tr>
<tr><td><code>JSONDecodeError</code></td><td>Invalid JSON text</td></tr>
<tr><td><code>NetmikoTimeoutException</code></td><td>Port 22 tak TCP session nahi: routing, ACL, SSH off</td></tr>
<tr><td><code>NetmikoAuthenticationException</code></td><td>TCP chala, login mana: user ya password</td></tr>
</table>

<h3>try aur except se exceptions handle karna</h3>
<p>Risky code ko <code>try</code> block mein rakho aur <code>except</code> mein batao kya karna hai. Jo exceptions aap expect karte ho sirf woh <b>specific</b> exceptions pakdo, taaki asli bugs dikhte rahein. <code>else</code> sirf tab chalta hai jab koi exception na ho; <code>finally</code> hamesha chalta hai.</p>
<pre class="code">failed = []
for ip in ips:
    try:
        conn = ConnectHandler(host=ip, **CREDS)
    except NetmikoTimeoutException:
        failed.append(ip + " unreachable")
        continue
    except NetmikoAuthenticationException:
        failed.append(ip + " login refused")
        continue
    else:
        print(conn.send_command("show version | include uptime"))
        conn.disconnect()
print("Failed:", failed)</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="try except flow">
<rect x="20" y="60" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="13">try: connect</text>
<rect x="240" y="10" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="325" y="37" text-anchor="middle" class="svg-ink" font-size="13">else: output collect</text>
<rect x="240" y="112" width="170" height="44" rx="8" fill="#fed7aa"/><text x="325" y="139" text-anchor="middle" class="svg-ink" font-size="13">except: log, continue</text>
<rect x="480" y="60" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="550" y="90" text-anchor="middle" class="svg-ink" font-size="13">agla device</text>
<line x1="150" y1="78" x2="240" y2="32" stroke="#64748b" stroke-width="2"/><text x="175" y="45" class="svg-accent" font-size="12">error nahi</text>
<line x1="150" y1="92" x2="240" y2="134" stroke="#64748b" stroke-width="2"/><text x="170" y="135" class="svg-accent" font-size="12">exception</text>
<line x1="410" y1="32" x2="480" y2="78" stroke="#64748b" stroke-width="2"/><line x1="410" y1="134" x2="480" y2="92" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek kharab device log hokar skip hota hai; run chalta rehta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> 300 devices, unme se 4 band hain. try/except ke bina backup pehle dead device par ruk jaata hai, maano number 12 par, aur 288 devices ka backup nahi banta. Upar wale loop ke saath 296 devices ka backup banta hai aur <code>failed</code> list bilkul un 4 ke naam batati hai jinke peeche jaana hai. Code ki length same, raat bilkul alag.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Bare <code>except:</code> jo sab kuch pakad leta hai, aapke apne typos aur Ctrl+C samet, aur unhe chhupa deta hai; loop ke andar report ko <code>"w"</code> se kholna, jisse har device pichhle ko overwrite karta hai (loop se pehle ek baar kholo, ya <code>"a"</code> use karo); aur <code>getpass()</code> ya <code>os.environ</code> se environment variables ki jagah script mein asli passwords hard-code karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tracebacks neeche ki line se upar padho. Timeout ka matlab TCP session kabhi bana hi nahi (reachability, ACL, SSH disabled, galat port); authentication exception ka matlab TCP chala aur credentials mana hue. <code>with open(...)</code> file automatically band karta hai.</p></div>

<div class="scn"><h4>Backup jo device 12 par ruk gaya</h4><p>Ek nightly configuration backup 300 routers cover karta tha. Ek subah team ko sirf 11 ke backups mile. Router 12 site move ke liye band tha, script ne <code>NetmikoTimeoutException</code> raise kiya, aur kyunki kisi ne use pakda nahi, poora run khatam ho gaya. Engineer ne connection ko do Netmiko exceptions ke liye try/except mein lapeta, failing host ko ek list mein joda, <code>continue</code> use kiya, aur end mein list email ki. Agli raat 299 backups safal hue aur report ne us ek router ka naam bataya jo move ho raha tha.</p><p><b>Seekh:</b> bahut saare devices par loop mein ek failure ko log karke skip karna chahiye, use run rokne nahi dena chahiye.</p></div>

<div class="iv"><p class="q">"Aapka script 500 devices chhoota hai. Jo devices down hain ya login reject karte hain unse kaise deal karoge?"</p><p>Strong answer: har connection ko try/except mein lapeto jo specific timeout aur authentication exceptions pakde, host aur wajah record karo, agle device par <code>continue</code> karo, aur end mein summary print ya send karo. Bare except use mat karo. Sensible connection timeout set karna, timestamps ke saath logging, aur changes ke liye verification fail hone par skip karne ki jagah rukna (<code>break</code>) batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>import module</code> ya <code>from module import name</code>; standard library ko install nahi chahiye, baaki pip se aate hain.</li>
<li><code>with open(file, mode)</code>: "r" padho, "w" overwrite, "a" append; file automatically band hoti hai.</li>
<li>Traceback neeche se upar padho: exception type aur message aakhir mein, file aur line upar.</li>
<li>try/except/else/finally; specific exceptions pakdo, bare except kabhi nahi.</li>
<li>Timeout = TCP session nahi; authentication exception = galat credentials.</li>
</ul></div>
`}};export{e as default};