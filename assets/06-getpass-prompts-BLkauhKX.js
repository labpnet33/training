var e={id:`getpass-prompts`,h:{en:`getpass: asking a person for a password without showing it`,hi:`getpass: insaan se password maangna bina dikhaye`},body:{en:`
<p><b>The idea of this chapter:</b> sometimes a human sits at the keyboard when the script runs: an engineer starting an audit, a night-shift operator running a one-off check. For that person, the best place for the password is <b>their own head</b>, typed when needed and never stored. The standard module <code>getpass</code> asks for it and does not show what is typed.</p>

<h3>Analogy: the ATM PIN pad</h3>
<p>When you type your PIN at an ATM, nothing appears on the screen and a shield hides your hand. The machine still gets the PIN; the people standing behind you do not. <code>getpass</code> is that shield for your terminal: the script receives the text, but the screen, the scrollback and a recording of the session do not show it.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="input shows the typed text, getpass hides it">
<rect x="10" y="20" width="290" height="100" rx="10" fill="#fecaca"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="13">input()</text><text x="155" y="74" text-anchor="middle" class="svg-ink" font-size="12">Password: NK@2026</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="11">typed text is on the screen</text>
<rect x="340" y="20" width="290" height="100" rx="10" fill="#bbf7d0"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="13">getpass.getpass()</text><text x="485" y="74" text-anchor="middle" class="svg-ink" font-size="12">Password:</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="11">nothing is shown</text>
</svg><p class="cap">Same typing, very different exposure.</p></div>

<h3>The basic pattern</h3>
<pre class="code">import getpass

pw = getpass.getpass("Router password: ")
print("got", len(pw), "characters")</pre>
<ul>
<li><code>getpass.getpass(prompt)</code> prints the prompt, reads one line without echoing it, and returns the text without the final new line.</li>
<li>The script prints only the <i>length</i> here. Never print the password itself while testing.</li>
</ul>
<div class="note"><p><b>Lab note.</b> In a real terminal you type the password and nothing appears. The lab terminal has no keyboard prompt of this kind, so <code>getpass</code> and <code>input()</code> read from <b>piped standard input</b>: <code>echo 'secret' | python3 x.py</code> feeds the line. Without a pipe, the lab returns an empty string. Piping a password with <code>echo</code> is for the lab and for tests with fake values only; on a real server it would put the password in your shell history.</p></div>
<pre class="out">AUTO01$ echo 'x' | python3 gp.py
Router password: got 1 characters
AUTO01$ python3 gp.py
Router password: 
got 0 characters</pre>
<p>In the first run the pipe supplied one character, <code>x</code>. In the second run nothing was supplied, so the password is empty. Notice that the prompt is followed directly by the next output in the piped case: a person's Enter key normally adds the line break that the pipe does not.</p>

<h3>Lab 1: switch audit.py to getpass</h3>
<p>The username can stay in the environment because a username is not secret, but the password will now come from the person. The lab helper <code>insert</code> adds the import on line 2, and one <code>sed</code> command replaces the <code>PASSWORD</code> line:</p>
<pre class="code">insert audit.py 2 import getpass
sed -i 's/^PASSWORD = .*/PASSWORD = getpass.getpass("Router password: ")/' audit.py
export NK_USER=netops</pre>
<pre class="out">AUTO01$ head -9 audit.py
"""audit.py - count the interfaces that are up on every router in devices.csv."""
import getpass
import csv
import os

from nkmiko import ConnectHandler

USER = os.environ["NK_USER"]
<span class="hl">PASSWORD = getpass.getpass("Router password: ")</span>
AUTO01$ echo 'NK@2026' | python3 audit.py
Router password: R1: 1 interface(s) up
R2: 1 interface(s) up</pre>
<p>The prompt appears once, at the top, because the assignment is outside <code>main()</code> and runs when the script starts. After the password is read, the script talks to R1 and R2 as before. The file <code>audit.py</code> contains no password, and neither does the shell command that a real person would type, because they type the password at the prompt.</p>
<p>What happens with a wrong password? The router refuses the login and <code>nkmiko</code> raises an exception that names the problem but not the password:</p>
<pre class="out">AUTO01$ echo 'wrongpass' | python3 audit.py
Router password: Traceback (most recent call last):
  File "audit.py", line 22, in &lt;module&gt;
    main()
  File "audit.py", line 15, in main
    conn = ConnectHandler(device_type="nk_ios", host=row["ip"], username=USER, password=PASSWORD)
<span class="hl">nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.</span>

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

Device settings: nk_ios 10.99.0.1:22</pre>
<p>This is a normal, safe failure. You learned in <code>py-tools</code> to catch such errors per device and carry on; here the point is that the traceback shows the <i>variable name</i> <code>PASSWORD</code> and never its value.</p>

<h3>Choosing between the three sources</h3>
<table class="cmp"><tr><th>Who runs the script?</th><th>Best source</th><th>Why</th></tr>
<tr><td>A person at a terminal</td><td><code>getpass</code></td><td>Nothing stored, nothing echoed</td></tr>
<tr><td>Cron or a service account</td><td><code>.env</code> (mode 600) or a vault</td><td>There is nobody to type</td></tr>
<tr><td>A shared pipeline</td><td>The pipeline's secret store, exposed as environment variables</td><td>Central rotation and audit</td></tr>
</table>
<p>A friendly tool supports the first two: use the environment when it is set, and ask the person otherwise.</p>
<pre class="code">import getpass
import os

password = os.environ.get("NK_PASS") or getpass.getpass("Router password: ")
print("password has", len(password), "characters")</pre>
<pre class="out">AUTO01$ python3 pw2.py
Router password: 
password has 0 characters
AUTO01$ export NK_PASS=NK@2026
AUTO01$ python3 pw2.py
password has 7 characters</pre>
<p>With <code>NK_PASS</code> set, <code>os.environ.get</code> returns the value and the <code>or</code> never reaches <code>getpass</code>. Without it, the prompt appears. In the first run nothing was piped, so the lab returned an empty password. A careful tool adds <code>if not password: raise SystemExit("empty password")</code> so that an empty answer stops the script before it touches a router.</p>

<div class="eg"><p><b>Worked example.</b> An engineer wants the interface audit once a week and does not want a password file on the shared jump host. She runs <code>python3 audit.py</code>, types the password at the prompt (nothing appears), and gets the report. Nothing about the password was stored, logged or visible to the colleague standing behind her.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>input()</code> for a password, which echoes it. Adding a <code>--password</code> command-line option: the typed command lands in shell history and in the process list, where other users can see it. Calling <code>getpass</code> inside a cron job, where nobody can answer the prompt and the job hangs or fails. Printing the password "just to check".</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>getpass.getpass()</code> hides the typing but does not encrypt or protect the value afterwards. Once it is in a Python variable, it is as sensitive as any secret: do not log it, print it or put it in an error message.</p></div>

<div class="scn"><h4>The password in the process list</h4><p>A team gave its audit tool a <code>--password</code> option. During a long run, a colleague on the same jump host typed <code>ps</code> and saw the full command line, password included. The tool was changed to read the password with <code>getpass</code> and the option was removed.</p><p><b>Lesson:</b> anything on a command line is public to the machine. Prompt for secrets instead.</p></div>

<div class="iv"><p class="q">"How would you take a password in an interactive Python script?"</p><p>With <code>getpass.getpass()</code>, which does not echo the characters. I would not use <code>input()</code> or a command-line argument, because both expose the password on screen or in history and process lists. For unattended jobs I would use an environment variable loaded from a protected <code>.env</code> or a secrets manager.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>getpass.getpass("prompt")</code> reads a line without echoing it.</li>
<li>Use it for people at a keyboard; use <code>.env</code> or a vault for cron and services.</li>
<li>In the lab it reads piped input: <code>echo 'secret' | python3 audit.py</code>.</li>
<li>Never put a password in a command-line option or an <code>input()</code> call.</li>
<li>The value is still a secret once it is in a variable.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> kabhi script chalate waqt keyboard par insaan baitha hota hai: audit shuru karta engineer, one-off check chalata night-shift operator. Us insaan ke liye password ki sabse achhi jagah <b>unka apna dimaag</b> hai, jab zaroorat ho tab type karo aur kabhi store mat karo. Standard module <code>getpass</code> use maangta hai aur jo type hota hai woh dikhata nahi.</p>

<h3>Analogy: ATM ka PIN pad</h3>
<p>ATM par PIN type karte ho to screen par kuch nahi aata aur ek shield aapka haath chhupa leta hai. Machine ko PIN mil jaata hai; aapke peeche khade logon ko nahi. <code>getpass</code> aapke terminal ka woh shield hai: script ko text milta hai, par screen, scrollback aur session ki recording use nahi dikhate.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="input type kiya text dikhata hai, getpass chhupata hai">
<rect x="10" y="20" width="290" height="100" rx="10" fill="#fecaca"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="13">input()</text><text x="155" y="74" text-anchor="middle" class="svg-ink" font-size="12">Password: NK@2026</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="11">type kiya text screen par hai</text>
<rect x="340" y="20" width="290" height="100" rx="10" fill="#bbf7d0"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="13">getpass.getpass()</text><text x="485" y="74" text-anchor="middle" class="svg-ink" font-size="12">Password:</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="11">kuch nahi dikhta</text>
</svg><p class="cap">Typing wahi, exposure bahut alag.</p></div>

<h3>Basic pattern</h3>
<pre class="code">import getpass

pw = getpass.getpass("Router password: ")
print("got", len(pw), "characters")</pre>
<ul>
<li><code>getpass.getpass(prompt)</code> prompt print karta hai, ek line bina echo ke padhta hai, aur aakhri new line ke bina text return karta hai.</li>
<li>Script yahan sirf <i>length</i> print karti hai. Test karte waqt password khud kabhi print mat karo.</li>
</ul>
<div class="note"><p><b>Lab note.</b> Asli terminal mein aap password type karte ho aur kuch nahi dikhta. Lab terminal mein is tarah ka keyboard prompt nahi hai, isliye <code>getpass</code> aur <code>input()</code> <b>piped standard input</b> se padhte hain: <code>echo 'secret' | python3 x.py</code> line deta hai. Pipe ke bina lab khaali string deta hai. <code>echo</code> se password pipe karna sirf lab aur nakli values ke tests ke liye hai; asli server par yeh password ko aapki shell history mein daal dega.</p></div>
<pre class="out">AUTO01$ echo 'x' | python3 gp.py
Router password: got 1 characters
AUTO01$ python3 gp.py
Router password: 
got 0 characters</pre>
<p>Pehle run mein pipe ne ek character, <code>x</code>, diya. Doosre run mein kuch nahi diya gaya, isliye password khaali hai. Dhyan do ki piped case mein prompt ke seedha baad agla output aata hai: insaan ki Enter key aam taur par woh line break jodti hai jo pipe nahi jodta.</p>

<h3>Lab 1: audit.py ko getpass par badlo</h3>
<p>Username environment mein reh sakta hai kyunki username secret nahi hota, par password ab insaan se aayega. Lab helper <code>insert</code> line 2 par import jodta hai, aur ek <code>sed</code> command <code>PASSWORD</code> line badalta hai:</p>
<pre class="code">insert audit.py 2 import getpass
sed -i 's/^PASSWORD = .*/PASSWORD = getpass.getpass("Router password: ")/' audit.py
export NK_USER=netops</pre>
<pre class="out">AUTO01$ head -9 audit.py
"""audit.py - count the interfaces that are up on every router in devices.csv."""
import getpass
import csv
import os

from nkmiko import ConnectHandler

USER = os.environ["NK_USER"]
<span class="hl">PASSWORD = getpass.getpass("Router password: ")</span>
AUTO01$ echo 'NK@2026' | python3 audit.py
Router password: R1: 1 interface(s) up
R2: 1 interface(s) up</pre>
<p>Prompt sirf ek baar, upar, aata hai kyunki assignment <code>main()</code> ke bahar hai aur script shuru hote hi chalti hai. Password padhne ke baad script pehle jaisa R1 aur R2 se baat karti hai. File <code>audit.py</code> mein password nahi hai, aur woh shell command bhi nahi jo asli insaan type karega, kyunki woh password prompt par type karta hai.</p>
<p>Galat password par kya hota hai? Router login refuse karta hai aur <code>nkmiko</code> exception raise karta hai jo problem ka naam batata hai par password ka nahi:</p>
<pre class="out">AUTO01$ echo 'wrongpass' | python3 audit.py
Router password: Traceback (most recent call last):
  File "audit.py", line 22, in &lt;module&gt;
    main()
  File "audit.py", line 15, in main
    conn = ConnectHandler(device_type="nk_ios", host=row["ip"], username=USER, password=PASSWORD)
<span class="hl">nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.</span>

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

Device settings: nk_ios 10.99.0.1:22</pre>
<p>Yeh normal, safe failure hai. <code>py-tools</code> mein aapne seekha ki aise errors har device par pakdo aur aage badho; yahan baat yeh hai ki traceback <i>variable ka naam</i> <code>PASSWORD</code> dikhata hai, uski value kabhi nahi.</p>

<h3>Teen sources mein se chunna</h3>
<table class="cmp"><tr><th>Script kaun chalata hai?</th><th>Best source</th><th>Kyon</th></tr>
<tr><td>Terminal par insaan</td><td><code>getpass</code></td><td>Kuch store nahi, kuch echo nahi</td></tr>
<tr><td>Cron ya service account</td><td><code>.env</code> (mode 600) ya vault</td><td>Type karne wala koi nahi</td></tr>
<tr><td>Shared pipeline</td><td>Pipeline ka secret store, environment variables ke roop mein</td><td>Central rotation aur audit</td></tr>
</table>
<p>Dostana tool pehle do support karta hai: environment set ho to use karo, warna insaan se poocho.</p>
<pre class="code">import getpass
import os

password = os.environ.get("NK_PASS") or getpass.getpass("Router password: ")
print("password has", len(password), "characters")</pre>
<pre class="out">AUTO01$ python3 pw2.py
Router password: 
password has 0 characters
AUTO01$ export NK_PASS=NK@2026
AUTO01$ python3 pw2.py
password has 7 characters</pre>
<p><code>NK_PASS</code> set hone par <code>os.environ.get</code> value deta hai aur <code>or</code> kabhi <code>getpass</code> tak nahi pahunchta. Set na ho to prompt aata hai. Pehle run mein kuch pipe nahi hua, isliye lab ne khaali password diya. Careful tool <code>if not password: raise SystemExit("empty password")</code> jodta hai taaki khaali jawab script ko router chhune se pehle rok de.</p>

<div class="eg"><p><b>Worked example.</b> Ek engineer ko hafte mein ek baar interface audit chahiye aur woh shared jump host par password file nahi chahti. Woh <code>python3 audit.py</code> chalati hai, prompt par password type karti hai (kuch nahi dikhta), aur report paati hai. Password ka kuch bhi store, log ya peeche khade colleague ko visible nahi hua.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Password ke liye <code>input()</code> use karna, jo echo karta hai. <code>--password</code> command-line option jodna: type kiya command shell history aur process list mein aa jaata hai, jahan doosre users dekh sakte hain. Cron job ke andar <code>getpass</code> call karna, jahan prompt ka jawab dene wala koi nahi aur job atak jaati hai ya fail hoti hai. "Bas check karne ke liye" password print karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>getpass.getpass()</code> typing chhupata hai par value ko baad mein encrypt ya protect nahi karta. Python variable mein aane ke baad woh kisi bhi secret jitna sensitive hai: use log, print ya error message mein mat daalo.</p></div>

<div class="scn"><h4>Process list mein password</h4><p>Ek team ne apne audit tool ko <code>--password</code> option diya. Lambe run ke dauran usi jump host par ek colleague ne <code>ps</code> type kiya aur poori command line, password samet, dekh li. Tool ko <code>getpass</code> se password padhne par badla gaya aur option hata diya gaya.</p><p><b>Lesson:</b> command line par jo kuch hai woh machine ke liye public hai. Secrets ke liye prompt karo.</p></div>

<div class="iv"><p class="q">"Interactive Python script mein password kaise loge?"</p><p><code>getpass.getpass()</code> se, jo characters echo nahi karta. Main <code>input()</code> ya command-line argument use nahi karunga, kyunki dono password ko screen par ya history aur process lists mein dikha dete hain. Unattended jobs ke liye protected <code>.env</code> se loaded environment variable ya secrets manager use karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>getpass.getpass("prompt")</code> ek line bina echo ke padhta hai.</li>
<li>Keyboard par insaan ke liye use karo; cron aur services ke liye <code>.env</code> ya vault.</li>
<li>Lab mein yeh piped input padhta hai: <code>echo 'secret' | python3 audit.py</code>.</li>
<li>Password ko command-line option ya <code>input()</code> call mein kabhi mat daalo.</li>
<li>Variable mein aane ke baad bhi value secret hi hai.</li>
</ul></div>
`}};export{e as default};