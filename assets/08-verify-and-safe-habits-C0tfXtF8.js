var e={id:`verify-and-safe-habits`,h:{en:`Verifying and safe habits`,hi:`Verify karna aur safe habits`},body:{en:`
<p>A pilot does not trust the plane because the engines sound fine. The pilot reads the checklist. Treat every script the same way: <b>check before, change, check after</b>. This chapter gives you a verification script and six habits that keep automation safe.</p>
<h3>A read-only verification script</h3>
<p>The script below checks the NTP line on every router and prints OK or MISSING. It uses one new idea, a decision. <code>if</code> runs its indented lines only when a condition is true; <code>else</code> runs when it is not. <code>"text" in output</code> is true when the text appears inside the output.</p>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.4", "10.99.0.5"]
for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    name = conn.find_prompt().replace("#", "")
    text = conn.send_command("show running-config | include ntp")
    if "ntp server 10.99.0.200" in text:
        print(name, "OK")
    else:
        print(name, "MISSING")
    conn.disconnect()</pre>
<p>Run it <b>before</b> the change (on freshly started routers) to see the starting point:</p>
<pre class="out">AUTO&gt; python3 verify_ntp.py
<span class="hl">KF-DEL-R1 MISSING</span>
<span class="hl">KF-MUM-R2 MISSING</span>
<span class="hl">KF-CHN-R3 MISSING</span>
<span class="hl">KF-KOL-R4 MISSING</span>
<span class="hl">KF-JAI-R5 MISSING</span></pre>
<p>After <code>ntp_push.py</code> has finished, run the same script again:</p>
<pre class="out">AUTO&gt; python3 verify_ntp.py
<span class="hl">KF-DEL-R1 OK</span>
<span class="hl">KF-MUM-R2 OK</span>
<span class="hl">KF-CHN-R3 OK</span>
<span class="hl">KF-KOL-R4 OK</span>
<span class="hl">KF-JAI-R5 OK</span></pre>
<p>Because it only sends a show command, this script is <b>read-only</b>: it cannot break anything. That makes it the best kind of first automation.</p>
<h3>Six safe habits</h3>
<ol>
<li><b>Read first.</b> Start with show-only scripts. Add config only when you trust the script.</li>
<li><b>Test on one device.</b> Put one lab or low-risk router in the list, check it, then add the rest.</li>
<li><b>Print what you do.</b> A line per device ("Working on ...") is your audit trail and your debugging clue.</li>
<li><b>Verify on the device.</b> The independent check (<code>show running-config | include ...</code>) is the proof.</li>
<li><b>Prefer repeatable changes.</b> Scripts you can run twice without harm are safer after a half-failed run.</li>
<li><b>Keep secrets out of the file.</b> Passwords typed in a script end up in backups and chat messages. The lab shows the placeholder <code>NK@2026</code> only because it is a lab.</li>
</ol>
<h3>Keep going when one device fails</h3>
<p>In chapter 7 one bad IP stopped the whole run. A <code>try</code> / <code>except</code> block lets the script catch an expected error, note it, and carry on with the next router. This is a preview; later modules teach it fully. The script below deliberately includes a bad IP:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException

ROUTERS = ["10.99.0.1", "10.99.0.40", "10.99.0.5"]
failed = []
for ip in ROUTERS:
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    except NetmikoTimeoutException:
        print("SKIPPED", ip, "- no SSH connection")
        failed.append(ip)
        continue
    print("OK", ip, conn.find_prompt())
    conn.disconnect()
print("Failed:", failed)</pre>
<pre class="out">AUTO&gt; python3 safe_loop.py
OK 10.99.0.1 KF-DEL-R1#
<span class="hl">SKIPPED 10.99.0.40 - no SSH connection</span>
OK 10.99.0.5 KF-JAI-R5#
<span class="hl">Failed: ['10.99.0.40']</span></pre>
<p>The bad address was skipped and noted; the other two routers were still visited. <code>continue</code> jumps straight to the next item in the list. At the end the script tells you what to look at: <code>Failed: ['10.99.0.40']</code>.</p>
<div class="note"><p>Reference code (not run in the simulator): in real projects you read the password from the environment instead of typing it, for example <code>password = os.environ["NET_PASS"]</code> after <code>import os</code>. Never commit real passwords to Git.</p></div>
<div class="warn"><p><b>Common mistake.</b> Treating "no error" as "success". A script can finish without an error and still have changed the wrong thing. Only a check on the device tells you the end state. Also never run a new config script on all devices as your first test.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>Idempotent</b> means that running the same operation again leaves the same end state. Expect this word, and expect "verify after change" as the right answer to workflow questions.</p></div>
<div class="scn"><h4>Green script, red network</h4><p>A script printed "done" for 30 switches, but a wrong VLAN number sat in its config list. Because the team ran it first on a single test switch and verified, they caught the wrong VLAN there. Nothing reached production. The verify script (read-only) was reused for every later change.</p><p><b>Lesson:</b> a test on one device plus an independent check catches mistakes while they are cheap.</p></div>
<div class="iv"><p class="q">"How do you make a network automation script safe to run in production?"</p><p>Review the script, run read-only checks first, test on one non-critical device, print a log line per device, handle expected errors so one failure does not leave the rollout half-done unnoticed, keep credentials out of the code, make the change repeatable, and verify the end state on the devices afterwards. A rollback plan or saved backup config is the final safeguard.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check before, change, check after.</li>
<li>Read-only scripts are the safest and the best place to start.</li>
<li>if / else lets a script decide; try / except lets it carry on after an expected error.</li>
<li>Idempotent scripts are safe to run twice.</li>
<li>Keep secrets out of scripts and out of Git.</li>
</ul></div>
`,hi:`
<p>Pilot sirf isliye plane par bharosa nahi karta ki engines ki awaaz theek hai. Woh checklist padhta hai. Har script ke saath yahi karo: <b>pehle check, change, baad mein check</b>. Yeh chapter aapko ek verification script aur chhe habits deta hai jo automation ko safe rakhte hain.</p>
<h3>Read-only verification script</h3>
<p>Neeche ka script har router par NTP line check karke OK ya MISSING print karta hai. Ismein ek naya idea hai, decision. <code>if</code> apni indented lines tabhi chalata hai jab condition true ho; <code>else</code> tab chalta hai jab na ho. <code>"text" in output</code> tab true hota hai jab text output ke andar dikhe.</p>
<pre class="code">from nkmiko import ConnectHandler

ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.4", "10.99.0.5"]
for ip in ROUTERS:
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    name = conn.find_prompt().replace("#", "")
    text = conn.send_command("show running-config | include ntp")
    if "ntp server 10.99.0.200" in text:
        print(name, "OK")
    else:
        print(name, "MISSING")
    conn.disconnect()</pre>
<p>Ise change se <b>pehle</b> chalao (naye start hue routers par) taaki shuruaati halat dikhe:</p>
<pre class="out">AUTO&gt; python3 verify_ntp.py
<span class="hl">KF-DEL-R1 MISSING</span>
<span class="hl">KF-MUM-R2 MISSING</span>
<span class="hl">KF-CHN-R3 MISSING</span>
<span class="hl">KF-KOL-R4 MISSING</span>
<span class="hl">KF-JAI-R5 MISSING</span></pre>
<p><code>ntp_push.py</code> khatam hone ke baad wahi script dobara chalao:</p>
<pre class="out">AUTO&gt; python3 verify_ntp.py
<span class="hl">KF-DEL-R1 OK</span>
<span class="hl">KF-MUM-R2 OK</span>
<span class="hl">KF-CHN-R3 OK</span>
<span class="hl">KF-KOL-R4 OK</span>
<span class="hl">KF-JAI-R5 OK</span></pre>
<p>Yeh sirf show command bhejta hai, isliye yeh <b>read-only</b> hai: kuch tod nahi sakta. Isliye yeh sabse achha pehla automation hai.</p>
<h3>Chhe safe habits</h3>
<ol>
<li><b>Pehle padho.</b> Sirf show wale scripts se shuru karo. Config tabhi jodo jab script par bharosa ho.</li>
<li><b>Ek device par test.</b> List mein ek lab ya low-risk router rakho, check karo, phir baaki jodo.</li>
<li><b>Jo karo woh print karo.</b> Har device ki ek line ("Working on ...") aapka audit trail aur debugging clue hai.</li>
<li><b>Device par verify karo.</b> Independent check (<code>show running-config | include ...</code>) hi saboot hai.</li>
<li><b>Repeatable changes pasand karo.</b> Jo scripts do baar chalane par nuksaan nahi karte woh adhoore fail ke baad safer hain.</li>
<li><b>Secrets file se bahar rakho.</b> Script mein type kiye passwords backups aur chat messages mein pahunch jaate hain. Lab mein placeholder <code>NK@2026</code> sirf isliye hai kyunki yeh lab hai.</li>
</ol>
<h3>Ek device fail ho to bhi aage badho</h3>
<p>Chapter 7 mein ek bad IP ne poora run rok diya. <code>try</code> / <code>except</code> block script ko expected error pakadne, use note karne aur agle router par jaane deta hai. Yeh preview hai; aage ke modules ise poori tarah sikhate hain. Neeche ka script jaan-boojh kar bad IP rakhta hai:</p>
<pre class="code">from nkmiko import ConnectHandler
from nkmiko.exceptions import NetmikoTimeoutException

ROUTERS = ["10.99.0.1", "10.99.0.40", "10.99.0.5"]
failed = []
for ip in ROUTERS:
    try:
        conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    except NetmikoTimeoutException:
        print("SKIPPED", ip, "- no SSH connection")
        failed.append(ip)
        continue
    print("OK", ip, conn.find_prompt())
    conn.disconnect()
print("Failed:", failed)</pre>
<pre class="out">AUTO&gt; python3 safe_loop.py
OK 10.99.0.1 KF-DEL-R1#
<span class="hl">SKIPPED 10.99.0.40 - no SSH connection</span>
OK 10.99.0.5 KF-JAI-R5#
<span class="hl">Failed: ['10.99.0.40']</span></pre>
<p>Bad address skip hokar note ho gaya; baaki do routers phir bhi visit hue. <code>continue</code> seedha list ke agle item par jaata hai. End mein script batata hai kya dekhna hai: <code>Failed: ['10.99.0.40']</code>.</p>
<div class="note"><p>Reference code (simulator mein nahi chalta): asli projects mein password type karne ki jagah environment se padhte hain, jaise <code>import os</code> ke baad <code>password = os.environ["NET_PASS"]</code>. Asli passwords kabhi Git mein commit mat karo.</p></div>
<div class="warn"><p><b>Common galti.</b> "Error nahi aaya" ko "success" maan lena. Script bina error ke khatam ho sakta hai aur phir bhi galat cheez badal sakta hai. Sirf device par check end state batata hai. Aur naya config script apne pehle test mein saare devices par kabhi mat chalao.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>Idempotent</b> ka matlab hai ki wahi operation dobara chalane par end state wahi rehti hai. Yeh word aayega, aur workflow ke sawaalon mein "change ke baad verify" sahi jawab hota hai.</p></div>
<div class="scn"><h4>Script green, network red</h4><p>Ek script ne 30 switches ke liye "done" print kiya, lekin uski config list mein galat VLAN number tha. Team ne ise pehle ek test switch par chalaya aur verify kiya, isliye wahin galat VLAN pakda gaya. Production tak kuch nahi pahuncha. Verify script (read-only) har agle change mein reuse hua.</p><p><b>Lesson:</b> ek device par test aur independent check galtiyon ko tab pakadte hain jab woh sasti hoti hain.</p></div>
<div class="iv"><p class="q">"Network automation script ko production mein safe kaise banate ho?"</p><p>Script review karo, pehle read-only checks chalao, ek non-critical device par test karo, har device ki log line print karo, expected errors handle karo taaki ek failure rollout ko chupchaap adhoora na chhode, credentials code se bahar rakho, change ko repeatable banao, aur baad mein devices par end state verify karo. Rollback plan ya saved backup config aakhri suraksha hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle check, change, baad mein check.</li>
<li>Read-only scripts sabse safe hain aur shuru karne ki best jagah.</li>
<li>if / else script ko decide karne deta hai; try / except expected error ke baad aage badhne deta hai.</li>
<li>Idempotent scripts do baar chalane par safe hain.</li>
<li>Secrets ko scripts aur Git se bahar rakho.</li>
</ul></div>
`}};export{e as default};