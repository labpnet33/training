var e={id:`try-except`,h:{en:`try / except: keep going when one router fails`,hi:`try / except: ek router fail ho tab bhi chalte raho`},body:{en:`
<p>In a real network some device is always down, rebooting, or has a changed password. A script that crashes on router 2 never reaches routers 3 to 50. <b>try/except</b> lets you say: "try this; if this particular error happens, do that instead, and carry on".</p>
<h3>The idea with a simple example</h3>
<p>Dividing by zero is an exception we can create on demand, so it is a safe way to see the structure. The code under <code>try:</code> is the risky part. If an exception happens there, Python jumps to the matching <code>except</code> block instead of stopping.</p>
<pre class="code">def share(total, people):
    return total / people

for people in [4, 0, 2]:
    try:
        print("Each gets", share(100, people))
    except ZeroDivisionError:
        print("Cannot share among", people, "people - skipping")

print("Script finished")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Each gets 25.0
Cannot share among 0 people - skipping
Each gets 50.0
Script finished</pre>
<p>Walk through it. For 4 people the division works and prints 25.0. For 0 people Python raises <code>ZeroDivisionError</code>; the <code>try</code> block stops at that line, the <code>except</code> block runs, and the loop continues with the next value. The last line proves the script was never killed.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="try / except flow"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">try:</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">risky code runs</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">no error</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">continue after the block</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">error</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">jump to except</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">next item</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">loop goes on</text></svg><p class="cap">try / except flow</p></div>
<h3>Handling a dead router in a loop</h3>
<p>Now the same pattern for devices. To keep this example runnable anywhere, <code>get_uptime</code> here is a stand-in that fails for one address. Replace it with a real login function in the lab.</p>
<pre class="code">def get_uptime(ip):
    if ip == "10.99.0.2":
        raise TimeoutError("no SSH session to " + ip)
    return "uptime is 3 days"

results = []
for ip in ["10.99.0.1", "10.99.0.2", "10.99.0.3"]:
    try:
        up = get_uptime(ip)
        results.append(f"{ip} OK {up}")
    except TimeoutError:
        results.append(f"{ip} FAILED unreachable")

for row in results:
    print(row)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">10.99.0.1 OK uptime is 3 days
10.99.0.2 FAILED unreachable
10.99.0.3 OK uptime is 3 days</pre>
<p>All three routers appear in the report. The dead one is recorded as FAILED instead of killing the script. This is the exact pattern of lab 2.</p>
<h3>The pieces you can add</h3>
<ul>
<li><b>Several excepts.</b> Different problems, different messages. Python runs the first one that matches.</li>
<li><b>as e.</b> <code>except TimeoutError as e:</code> gives the error object the name <code>e</code>. <code>print(e)</code> shows its message and <code>type(e).__name__</code> its class name.</li>
<li><b>Several classes at once.</b> <code>except (TimeoutError, PermissionError):</code>.</li>
<li><b>else.</b> Runs only if there was <b>no</b> error. <b>finally.</b> Runs always, error or not; good for "close the connection".</li>
</ul>
<pre class="code">def risky(n):
    if n == 1:
        raise TimeoutError("device did not answer")
    if n == 2:
        raise PermissionError("login refused")
    return "ok"

for n in [0, 1, 2]:
    try:
        value = risky(n)
    except TimeoutError as e:
        print(n, "timeout:", e)
    except PermissionError as e:
        print(n, "denied:", type(e).__name__, "-", e)
    else:
        print(n, "worked:", value)
    finally:
        print(n, "done")</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">0 worked: ok
0 done
1 timeout: device did not answer
1 done
2 denied: PermissionError - login refused
2 done</pre>
<h3>Catch specific errors, not everything</h3>
<p>A bare <code>except:</code> catches <b>every</b> error, including your own typos, and hides them. Watch what happens when a typo (<code>reslt</code>) hides inside a <code>try</code> with a bare <code>except</code>:</p>
<pre class="code">results = []
for ip in ["10.99.0.1", "10.99.0.3"]:
    try:
        reslt.append(ip)
    except:
        results.append(ip + " FAILED")
print(results)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">['10.99.0.1 FAILED', '10.99.0.3 FAILED']</pre>
<p>Both routers are reported as FAILED, but the network is perfectly fine; the real bug is a <code>NameError</code> caused by a typo, and the bare <code>except</code> swallowed it. Catch only the exceptions you <b>expect</b>, so real bugs still produce a traceback.</p>
<h3>Avoiding the exception in the first place</h3>
<p>Some errors are better prevented. A dictionary's <code>.get()</code> returns <code>None</code> (or a default you choose) instead of raising <code>KeyError</code>:</p>
<pre class="code">device = {"name": "R1"}
print(device.get("vlan"))
print(device.get("vlan", "no vlan set"))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">None
no vlan set</pre>
<h3>The real lab code</h3>
<p>For lab 2 the stand-in is replaced by SSH calls through the lab library. This is reference code for the lab, wrapped as you will write it.</p>
<p><i>Reference code (not run in the simulator).</i></p><pre class="code">from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

for ip in ROUTERS:
    try:
        up = get_uptime(ip)
        results.append(f"{ip} OK {up}")
    except NetmikoTimeoutException:
        results.append(f"{ip} FAILED unreachable")
    except NetmikoAuthenticationException:
        results.append(f"{ip} FAILED login")</pre>
<p>Remember: handling the error is not <b>fixing</b> the network. After the script reports FAILED, find the root cause and repair it.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) A bare <code>except:</code> that hides typos. (2) Putting too much code in <code>try</code>, so you no longer know which line failed. (3) Forgetting to indent <code>except</code> at the same level as <code>try</code>. (4) Catching an error, printing nothing, and never telling anyone a device was skipped. Always record it.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>finally</code> runs whether or not an error occurred, <code>else</code> only when there was none. Python checks the <code>except</code> blocks in order and runs the first match, so put specific classes before general ones.</p></div>
<div class="scn"><h4>The silent skip</h4><p>A configuration-audit script wrapped everything in <code>try/except: pass</code>. For three weeks it reported no problems. When the auditors checked, two of the 30 routers had never been reached: the credentials were wrong and the script quietly skipped them. After that the team logged every skipped device with its exception class, and the report ended with a count of OK and FAILED.</p>
<p><b>Lesson:</b> an except block must record what it caught, never hide it.</p></div>
<div class="iv"><p class="q">"Why is a bare except a bad idea?"</p><p>It catches every exception, including programming mistakes such as typos and unexpected conditions, so bugs become silent. I catch the specific classes I expect, for example the Netmiko timeout and authentication exceptions, log them, and let everything else surface as a traceback.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>try:</code> holds the risky lines; <code>except SomeError:</code> runs only if that error happens.</li>
<li>The loop carries on with the next device after an except block.</li>
<li><code>as e</code> gives the error object; <code>finally</code> always runs; <code>else</code> runs only without error.</li>
<li>Catch specific exceptions; a bare except hides your own bugs.</li>
<li>Record every failure; handling an error does not fix the network.</li>
</ul></div>
`,hi:`
<p>Real network mein koi na koi device hamesha down, reboot mein, ya badle hue password wala hota hai. Jo script router 2 par crash ho woh router 3 se 50 tak kabhi nahi pahunchti. <b>try/except</b> se aap kehte ho: "yeh try karo; agar yeh khaas error aaye to uske badle woh karo, aur aage badho".</p>
<h3>Ek simple example se idea</h3>
<p>Zero se divide karna aisa exception hai jo hum jab chahein bana sakte hain, isliye structure dekhne ka safe tareeka hai. <code>try:</code> ke neeche ka code risky hissa hai. Wahan exception aaye to Python rukne ki jagah matching <code>except</code> block par jump karta hai.</p>
<pre class="code">def share(total, people):
    return total / people

for people in [4, 0, 2]:
    try:
        print("Each gets", share(100, people))
    except ZeroDivisionError:
        print("Cannot share among", people, "people - skipping")

print("Script finished")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Each gets 25.0
Cannot share among 0 people - skipping
Each gets 50.0
Script finished</pre>
<p>Dhyaan se dekho. 4 logon ke liye division chalta hai aur 25.0 print hota hai. 0 logon ke liye Python <code>ZeroDivisionError</code> raise karta hai; <code>try</code> block us line par ruk jaata hai, <code>except</code> block chalta hai, aur loop agli value ke saath jaari rehta hai. Aakhri line saabit karti hai ki script kabhi maari nahi gayi.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="try / except ka flow"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">try:</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">risky code chalta hai</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">error nahi</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">block ke baad aage</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">error</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">except par jump</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">agla item</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">loop chalta rehta hai</text></svg><p class="cap">try / except ka flow</p></div>
<h3>Loop mein dead router handle karna</h3>
<p>Ab wahi pattern devices ke liye. Example kahin bhi chal sake isliye yahan <code>get_uptime</code> ek stand-in hai jo ek address ke liye fail hota hai. Lab mein ise asli login function se badlo.</p>
<pre class="code">def get_uptime(ip):
    if ip == "10.99.0.2":
        raise TimeoutError("no SSH session to " + ip)
    return "uptime is 3 days"

results = []
for ip in ["10.99.0.1", "10.99.0.2", "10.99.0.3"]:
    try:
        up = get_uptime(ip)
        results.append(f"{ip} OK {up}")
    except TimeoutError:
        results.append(f"{ip} FAILED unreachable")

for row in results:
    print(row)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">10.99.0.1 OK uptime is 3 days
10.99.0.2 FAILED unreachable
10.99.0.3 OK uptime is 3 days</pre>
<p>Teeno routers report mein aaye. Dead router script ko maarne ki jagah FAILED ke roop mein record hua. Lab 2 ka exact pattern yahi hai.</p>
<h3>Jo hisse aap jod sakte ho</h3>
<ul>
<li><b>Kai excepts.</b> Alag problems, alag messages. Python pehla jo match kare woh chalata hai.</li>
<li><b>as e.</b> <code>except TimeoutError as e:</code> error object ko naam <code>e</code> deta hai. <code>print(e)</code> uska message dikhata hai aur <code>type(e).__name__</code> class ka naam.</li>
<li><b>Ek saath kai classes.</b> <code>except (TimeoutError, PermissionError):</code>.</li>
<li><b>else.</b> Sirf tab chalta hai jab error <b>nahi</b> aaya. <b>finally.</b> Hamesha chalta hai, error aaye ya na aaye; "connection band karo" ke liye achha.</li>
</ul>
<pre class="code">def risky(n):
    if n == 1:
        raise TimeoutError("device did not answer")
    if n == 2:
        raise PermissionError("login refused")
    return "ok"

for n in [0, 1, 2]:
    try:
        value = risky(n)
    except TimeoutError as e:
        print(n, "timeout:", e)
    except PermissionError as e:
        print(n, "denied:", type(e).__name__, "-", e)
    else:
        print(n, "worked:", value)
    finally:
        print(n, "done")</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">0 worked: ok
0 done
1 timeout: device did not answer
1 done
2 denied: PermissionError - login refused
2 done</pre>
<h3>Specific errors pakdo, sab kuch nahi</h3>
<p>Khaali <code>except:</code> <b>har</b> error pakadta hai, aapke apne typos bhi, aur unhe chhupa deta hai. Dekho jab typo (<code>reslt</code>) bare <code>except</code> wale <code>try</code> mein chhup jaata hai:</p>
<pre class="code">results = []
for ip in ["10.99.0.1", "10.99.0.3"]:
    try:
        reslt.append(ip)
    except:
        results.append(ip + " FAILED")
print(results)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">['10.99.0.1 FAILED', '10.99.0.3 FAILED']</pre>
<p>Dono routers FAILED report hue, lekin network bilkul theek hai; asli bug typo se bana <code>NameError</code> hai aur bare <code>except</code> ne use nigal liya. Sirf wahi exceptions pakdo jinki aapko <b>umeed</b> hai, taaki asli bugs ka traceback aaye.</p>
<h3>Exception ko pehle hi rokna</h3>
<p>Kuch errors ko rokna behtar hai. Dictionary ka <code>.get()</code> <code>KeyError</code> raise karne ki jagah <code>None</code> (ya aapki chuni default) deta hai:</p>
<pre class="code">device = {"name": "R1"}
print(device.get("vlan"))
print(device.get("vlan", "no vlan set"))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">None
no vlan set</pre>
<h3>Asli lab code</h3>
<p>Lab 2 mein stand-in ki jagah lab library se SSH calls aati hain. Yeh lab ke liye reference code hai, waise lapeta hua jaise aap likhoge.</p>
<p><i>Reference code (simulator mein nahi chalta).</i></p><pre class="code">from nkmiko.exceptions import NetmikoTimeoutException, NetmikoAuthenticationException

for ip in ROUTERS:
    try:
        up = get_uptime(ip)
        results.append(f"{ip} OK {up}")
    except NetmikoTimeoutException:
        results.append(f"{ip} FAILED unreachable")
    except NetmikoAuthenticationException:
        results.append(f"{ip} FAILED login")</pre>
<p>Yaad rakho: error handle karna network <b>fix</b> karna nahi hai. Script FAILED bataye uske baad root cause dhoondho aur repair karo.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Bare <code>except:</code> jo typos chhupata hai. (2) <code>try</code> mein bahut zyada code daalna, phir pata nahi chalta kaun si line fail hui. (3) <code>except</code> ko <code>try</code> ke barabar level par indent karna bhoolna. (4) Error pakadna, kuch print na karna, aur kisi ko na batana ki device skip hua. Hamesha record karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>finally</code> error ho ya na ho chalta hai, <code>else</code> sirf tab jab error nahi tha. Python <code>except</code> blocks ko order mein check karke pehla match chalata hai, isliye specific classes general se pehle rakho.</p></div>
<div class="scn"><h4>Chupchaap skip</h4><p>Ek configuration-audit script ne sab kuch <code>try/except: pass</code> mein lapet diya tha. Teen hafte tak usne koi problem report nahi ki. Auditors ne check kiya to 30 mein se do routers kabhi pahunche hi nahi the: credentials galat the aur script chupchaap skip kar rahi thi. Uske baad team ne har skipped device ko exception class ke saath log kiya, aur report OK aur FAILED ki ginti par khatam hoti thi.</p>
<p><b>Lesson:</b> except block ko jo pakda woh record karna chahiye, chhupana nahi.</p></div>
<div class="iv"><p class="q">"Bare except bura idea kyun hai?"</p><p>Yeh har exception pakadta hai, typos aur anjaan conditions jaise programming mistakes bhi, isliye bugs silent ho jaate hain. Main wahi specific classes pakadta hoon jinki umeed hai, jaise Netmiko timeout aur authentication exceptions, unhe log karta hoon, aur baaki sab ko traceback ke roop mein surface hone deta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>try:</code> mein risky lines; <code>except SomeError:</code> sirf us error par chalta hai.</li>
<li>except block ke baad loop agle device ke saath chalta rehta hai.</li>
<li><code>as e</code> error object deta hai; <code>finally</code> hamesha chalta hai; <code>else</code> sirf bina error ke.</li>
<li>Specific exceptions pakdo; bare except aapke apne bugs chhupata hai.</li>
<li>Har failure record karo; error handle karna network fix karna nahi hai.</li>
</ul></div>
`}};export{e as default};