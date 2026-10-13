var e={id:`reading-errors`,h:{en:`Reading errors without panic`,hi:`Errors bina ghabraye padhna`},body:{en:`
<p>Every programmer sees errors every day. An error is not a failure; it is Python telling you <b>exactly</b> what went wrong and on which line. When a script stops, Python prints a <b>traceback</b>: a short report of the path it took before it fell. Learning to read it calmly is the most useful skill in this module, and Lab 2 trains it on purpose.</p>
<h3>The Lab 2 failure</h3>
<p>Kaveri Foods' <code>ntp_push.py</code> has a typo in its router list: the fourth address is written <code>10.99.0.40</code> but the router is <code>10.99.0.4</code>. Run it and watch:</p>
<pre class="out">AUTO&gt; python3 ntp_push.py
Working on 10.99.0.1
  NTP set, config saved
Working on 10.99.0.2
  NTP set, config saved
Working on 10.99.0.3
  NTP set, config saved
<span class="hl">Working on 10.99.0.40</span>
Traceback (most recent call last):
  File "ntp_push.py", line 16, in &lt;module&gt;
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
<span class="hl">nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span>

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios 10.99.0.40:22
(connection timed out)</pre>
<h3>Four steps to read it</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Reading steps">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">1. Last line</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">error type + text</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">2. File + line</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">where it failed</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">3. Output before</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">which device?</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">4. Think network</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">what does it mean</text>
</svg><p class="cap">Read a traceback from the bottom up, then connect it to what the script printed.</p></div>
<ol>
<li><b>Go to the last line first.</b> It names the error type, <code>NetmikoTimeoutException</code>, and a message: the TCP connection to the device failed.</li>
<li><b>Find the file and line number</b> just above: <code>ntp_push.py</code>, line 16, the ConnectHandler call.</li>
<li><b>Look at what was printed before the traceback:</b> "Working on 10.99.0.40". That is the device that caused it.</li>
<li><b>Think like a network engineer.</b> A timeout means no TCP session on port 22. Wrong IP? Router down? SSH not enabled? Here the IP is a typo.</li>
</ol>
<h3>What state did the failure leave behind?</h3>
<p>Python runs line by line. The routers handled before the error keep their change; the router that failed and the ones after it get nothing. A short read-only script, <code>verify_ntp.py</code>, shows the truth (you will write it in chapter 8):</p>
<pre class="out">AUTO&gt; python3 verify_ntp.py
KF-DEL-R1 OK
KF-MUM-R2 OK
KF-CHN-R3 OK
<span class="hl">KF-KOL-R4 MISSING</span>
<span class="hl">KF-JAI-R5 MISSING</span></pre>
<p>Three routers are done, two are not. This half-done state is exactly why you must verify, not assume.</p>
<h3>Fix and run again</h3>
<pre class="out">Before: 8  ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.40", "10.99.0.5"]
After:  8  ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.4", "10.99.0.5"]</pre>
<pre class="out">AUTO&gt; python3 ntp_push.py
Working on 10.99.0.1
  NTP set, config saved
Working on 10.99.0.2
  NTP set, config saved
Working on 10.99.0.3
  NTP set, config saved
Working on 10.99.0.4
  NTP set, config saved
Working on 10.99.0.5
  NTP set, config saved
<span class="hl">Routers changed: 5</span></pre>
<p>Running the script twice is safe here, because setting the same NTP line again changes nothing. Scripts with this property are called <b>idempotent</b>: running them again gives the same end state.</p>
<h3>Other errors you will meet</h3>
<pre class="out">AUTO&gt; python3 bad_pw.py
Traceback (most recent call last):
  File "bad_pw.py", line 2, in &lt;module&gt;
    conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="not-the-password")
<span class="hl">nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.</span>

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

Device settings: nk_ios 10.99.0.1:22</pre>
<pre class="out">AUTO&gt; python3 typo.py
Traceback (most recent call last):
  File "typo.py", line 2, in &lt;module&gt;
    print(router)
<span class="hl">NameError: name 'router' is not defined. Did you mean: 'routers'?</span></pre>
<table class="cmp"><thead><tr><th>Error</th><th>Usually means</th><th>First check</th></tr></thead><tbody>
<tr><td><code>NetmikoTimeoutException</code></td><td>No TCP connection to port 22</td><td>IP typo, router down, SSH off</td></tr>
<tr><td><code>NetmikoAuthenticationException</code></td><td>Login rejected</td><td>Username, password, AAA</td></tr>
<tr><td><code>SyntaxError</code></td><td>Python cannot read the text</td><td>Quote, bracket, colon</td></tr>
<tr><td><code>NameError</code></td><td>A word Python does not know</td><td>Spelling of the variable</td></tr>
</tbody></table>
<div class="warn"><p><b>Common mistake.</b> Reading from the top of the traceback and getting lost. Start from the last line. Also do not re-run a half-failed script blindly if it is not safe to repeat; check the state first.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exception name tells the category: timeout = reachability or SSH, authentication = credentials, SyntaxError = typing mistake before anything runs, NameError = unknown name at run time.</p></div>
<div class="scn"><h4>The typo that became a lesson</h4><p>At Kaveri Foods the rollout stopped on the fourth router with a timeout. The engineer read the last line, saw the printed "Working on 10.99.0.40", realised the router is .4, fixed one character, and ran the script again. Total time: about two minutes of thinking, and a full list of five routers verified.</p><p><b>Lesson:</b> the traceback plus the last printed line almost always points to the cause.</p></div>
<div class="iv"><p class="q">"A script stops with a connection timeout on one device. What do you do?"</p><p>Read the last line (timeout), find which device was being processed from the output before it, then check IP correctness, reachability (ping), and whether SSH is enabled. Then check which devices were already changed, fix the cause, and re-run, making sure the script is safe to repeat.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A traceback is a helpful report: read the last line first.</li>
<li>The line number and the output printed before it identify the device.</li>
<li>A stopped script leaves earlier devices changed and later ones untouched.</li>
<li>Run, read, fix, run again is normal programming.</li>
</ul></div>
`,hi:`
<p>Har programmer roz errors dekhta hai. Error failure nahi hai; yeh Python aapko <b>bilkul</b> batata hai ki kya galat hua aur kaunsi line par. Jab script rukta hai, Python ek <b>traceback</b> print karta hai: girne se pehle ke raaste ki chhoti report. Ise shaanti se padhna sikhna is module ki sabse kaam ki skill hai, aur Lab 2 ise jaan-boojh kar train karta hai.</p>
<h3>Lab 2 ka failure</h3>
<p>Kaveri Foods ki <code>ntp_push.py</code> mein router list mein typo hai: chautha address <code>10.99.0.40</code> likha hai lekin router <code>10.99.0.4</code> hai. Chalao aur dekho:</p>
<pre class="out">AUTO&gt; python3 ntp_push.py
Working on 10.99.0.1
  NTP set, config saved
Working on 10.99.0.2
  NTP set, config saved
Working on 10.99.0.3
  NTP set, config saved
<span class="hl">Working on 10.99.0.40</span>
Traceback (most recent call last):
  File "ntp_push.py", line 16, in &lt;module&gt;
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
<span class="hl">nkmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span>

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: nk_ios 10.99.0.40:22
(connection timed out)</pre>
<h3>Ise padhne ke chaar steps</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Reading steps">
<rect x="10" y="22" width="129" height="74" rx="10" fill="#fde68a"/><text x="74.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">1. Aakhri line</text><text x="74.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">error type + text</text><line x1="141" y1="59" x2="171" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="171,59 164,55 164,63" fill="#64748b"/><rect x="173" y="22" width="129" height="74" rx="10" fill="#bae6fd"/><text x="237.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">2. File + line</text><text x="237.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">kahan fail hua</text><line x1="304" y1="59" x2="334" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="334,59 327,55 327,63" fill="#64748b"/><rect x="336" y="22" width="129" height="74" rx="10" fill="#ddd6fe"/><text x="400.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">3. Pehle output</text><text x="400.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">kaunsa device?</text><line x1="467" y1="59" x2="497" y2="59" stroke="#64748b" stroke-width="2"/><polygon points="497,59 490,55 490,63" fill="#64748b"/><rect x="499" y="22" width="129" height="74" rx="10" fill="#bbf7d0"/><text x="563.5" y="52" text-anchor="middle" class="svg-ink" font-size="14">4. Network socho</text><text x="563.5" y="74" text-anchor="middle" class="svg-muted" font-size="12">iska matlab kya</text>
</svg><p class="cap">Traceback ko neeche se upar padho, phir script ke print kiye output se jodo.</p></div>
<ol>
<li><b>Pehle aakhri line par jao.</b> Woh error type, <code>NetmikoTimeoutException</code>, aur message batati hai: device se TCP connection fail hua.</li>
<li><b>File aur line number dhoondho</b> theek upar: <code>ntp_push.py</code>, line 16, ConnectHandler wali call.</li>
<li><b>Traceback se pehle kya print hua dekho:</b> "Working on 10.99.0.40". Yahi woh device hai jisne problem di.</li>
<li><b>Network engineer ki tarah socho.</b> Timeout matlab port 22 par TCP session nahi bana. Galat IP? Router down? SSH enabled nahi? Yahan IP typo hai.</li>
</ol>
<h3>Failure ne kya halat chhodi?</h3>
<p>Python line by line chalta hai. Error se pehle ke routers apna change rakhte hain; jo router fail hua aur uske baad ke routers ko kuch nahi milta. Ek chhota read-only script, <code>verify_ntp.py</code>, sach dikhata hai (ise aap chapter 8 mein likhoge):</p>
<pre class="out">AUTO&gt; python3 verify_ntp.py
KF-DEL-R1 OK
KF-MUM-R2 OK
KF-CHN-R3 OK
<span class="hl">KF-KOL-R4 MISSING</span>
<span class="hl">KF-JAI-R5 MISSING</span></pre>
<p>Teen routers ho gaye, do nahi. Yeh adhoori halat hi wajah hai ki verify karna padta hai, maan nahi lena chahiye.</p>
<h3>Fix karo aur dobara chalao</h3>
<pre class="out">Before: 8  ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.40", "10.99.0.5"]
After:  8  ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.4", "10.99.0.5"]</pre>
<pre class="out">AUTO&gt; python3 ntp_push.py
Working on 10.99.0.1
  NTP set, config saved
Working on 10.99.0.2
  NTP set, config saved
Working on 10.99.0.3
  NTP set, config saved
Working on 10.99.0.4
  NTP set, config saved
Working on 10.99.0.5
  NTP set, config saved
<span class="hl">Routers changed: 5</span></pre>
<p>Yahan script ko do baar chalana safe hai, kyunki wahi NTP line dobara set karne se kuch nahi badalta. Aisi property wale scripts <b>idempotent</b> kehlate hain: dobara chalane par bhi end state wahi rehti hai.</p>
<h3>Doosre errors jo aapko milenge</h3>
<pre class="out">AUTO&gt; python3 bad_pw.py
Traceback (most recent call last):
  File "bad_pw.py", line 2, in &lt;module&gt;
    conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="not-the-password")
<span class="hl">nkmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.</span>

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

Device settings: nk_ios 10.99.0.1:22</pre>
<pre class="out">AUTO&gt; python3 typo.py
Traceback (most recent call last):
  File "typo.py", line 2, in &lt;module&gt;
    print(router)
<span class="hl">NameError: name 'router' is not defined. Did you mean: 'routers'?</span></pre>
<table class="cmp"><thead><tr><th>Error</th><th>Aksar matlab</th><th>Pehle check karo</th></tr></thead><tbody>
<tr><td><code>NetmikoTimeoutException</code></td><td>Port 22 par TCP connection nahi</td><td>IP typo, router down, SSH band</td></tr>
<tr><td><code>NetmikoAuthenticationException</code></td><td>Login reject hua</td><td>Username, password, AAA</td></tr>
<tr><td><code>SyntaxError</code></td><td>Python text padh nahi sakta</td><td>Quote, bracket, colon</td></tr>
<tr><td><code>NameError</code></td><td>Aisa word jo Python nahi jaanta</td><td>Variable ki spelling</td></tr>
</tbody></table>
<div class="warn"><p><b>Common galti.</b> Traceback ko upar se padhna aur kho jaana. Aakhri line se shuru karo. Aur agar script repeat karna safe nahi hai to adhoore fail hue script ko andhadhund dobara mat chalao; pehle state check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exception ka naam category batata hai: timeout = reachability ya SSH, authentication = credentials, SyntaxError = kuch chalne se pehle typing ki galti, NameError = run time par anjaana naam.</p></div>
<div class="scn"><h4>Typo jo lesson ban gaya</h4><p>Kaveri Foods mein rollout chauthe router par timeout se ruk gaya. Engineer ne aakhri line padhi, print hua "Working on 10.99.0.40" dekha, samjha ki router .4 hai, ek character theek kiya, aur script dobara chalayi. Poori list ke paanchon routers verify hue.</p><p><b>Lesson:</b> traceback aur aakhri print hui line lagbhag hamesha wajah tak pahuncha deti hai.</p></div>
<div class="iv"><p class="q">"Script ek device par connection timeout se ruk jaata hai. Aap kya karoge?"</p><p>Aakhri line padho (timeout), usse pehle ke output se dekho kaunsa device process ho raha tha, phir IP ki sahi hone, reachability (ping) aur SSH enabled hai ya nahi check karo. Phir dekho kaunse devices pehle hi badal chuke hain, wajah fix karo, aur script dobara chalao, yeh dhyan rakhte hue ki woh repeat karna safe ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traceback ek madadgaar report hai: pehle aakhri line padho.</li>
<li>Line number aur usse pehle ka output device ko pehchaante hain.</li>
<li>Ruka hua script pehle ke devices badle hue aur baad ke untouched chhodta hai.</li>
<li>Chalao, padho, fix karo, phir chalao: yahi normal programming hai.</li>
</ul></div>
`}};export{e as default};