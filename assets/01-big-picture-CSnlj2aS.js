var e=(e,t,n,r,i,a)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="44" rx="8" fill="`+r+`"/>`+(a?`<text x="`+(e+n/2)+`" y="`+(t+20)+`" text-anchor="middle" class="svg-ink" font-size="12">`+i+`</text><text x="`+(e+n/2)+`" y="`+(t+36)+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`:`<text x="`+(e+n/2)+`" y="`+(t+27)+`" text-anchor="middle" class="svg-ink" font-size="13">`+i+`</text>`),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(n,r,i)=>`<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="The safe-change loop">`+e(20,24,140,`#bae6fd`,`1 lock()`)+e(180,24,140,`#bae6fd`,`2 load()`)+e(340,24,140,`#ddd6fe`,`3 diff()`)+e(500,24,120,`#ddd6fe`,`4 commit_check()`)+t(160,46,178,46)+t(320,46,338,46)+t(480,46,498,46)+t(560,68,560,102)+e(500,104,120,`#fde68a`,`5 commit(`,`confirm=2)`)+e(340,104,140,`#fed7aa`,`6 healthy()?`)+e(180,104,140,`#bbf7d0`,`7 commit()`)+e(20,104,140,`#bbf7d0`,`8 unlock()`)+t(500,126,482,126)+t(340,126,322,126)+t(180,126,162,126)+`<rect x="20" y="178" width="600" height="36" rx="8" fill="#fecaca"/><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="13">`+r+`</text><line x1="410" y1="148" x2="410" y2="176" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 3"/><text x="250" y="98" text-anchor="middle" class="svg-muted" font-size="11">`+i+`</text></svg><p class="cap">`+n+`</p></div>`,r={id:`big-picture`,h:{en:`The big picture: a change you can review, undo and repeat`,hi:`Big picture: aisa change jo review, undo aur repeat ho sake`},body:{en:`
<p>Every network engineer has a story about a change that went wrong at midnight: a typo in a prefix list, a management address moved by mistake, a colleague's half-finished edit committed together with yours. A script does not make you safer by itself. A script makes the same mistake on twenty routers in ten seconds. What makes you safer is a script that behaves like a careful engineer: it takes a lock, looks at the difference, asks the router to check the change, makes it live with an undo timer, looks at the network, and only then makes it permanent.</p>

<p>Junos is unusually good at this, because the operating system was designed around a candidate configuration, a commit model and a rollback history. The PyEZ <b>Config</b> utility is the Python handle on all of that. This module teaches you to use it in the order a careful engineer would.</p>

<h3>What you will learn</h3>
<ul>
<li>Use <code>jnpr.junos.utils.config.Config</code>: take and release the lock, work in shared, private or exclusive mode.</li>
<li>Load configuration in <b>set</b>, <b>text</b>, <b>XML</b> and <b>JSON</b>, from a string or a file, and render it from Jinja2 templates.</li>
<li>Choose between <b>merge</b>, <b>replace</b> and <b>override</b>, and know which one can lock you out of a router.</li>
<li>Read <code>diff()</code>, run <code>commit_check()</code>, and understand <code>ConfigLoadError</code> and <code>CommitError</code>.</li>
<li>Commit with <code>confirm=</code>, write your own <code>healthy(dev)</code> check, and roll back, yourself or by letting the router do it.</li>
<li>Fix four unsafe pushes: no lock, no check, no rollback, merge where replace was needed.</li>
</ul>

<h3>Prerequisites</h3>
<dl class="terms">
<dt>adv-pyez</dt><dd>Opening a <code>Device</code>, reading facts, calling RPCs, and the connection and RPC exceptions. Here we use <code>Device(...).open()</code> without re-teaching it.</dd>
<dt>adv-netconf</dt><dd>What a candidate datastore, a lock and a confirmed commit are at the protocol level. PyEZ sends the same NETCONF operations for you, so we refer back instead of repeating them.</dd>
<dt>py-templates</dt><dd>Jinja2 loops and conditions. Chapter 4 reuses them to generate Junos set commands.</dd>
<dt>py-safepush</dt><dd>The Program 1 habit: dry run, backup, diff, verify, roll back. This module is the same habit, using the machinery Junos already has.</dd></dl>

<h3>An analogy: tracing paper over a blueprint</h3>
<p>The <b>running</b> configuration is the approved blueprint on the wall. The <b>candidate</b> is a sheet of tracing paper laid on top. You draw your change on the paper, and nothing in the building moves. You hold the paper up and compare it with the blueprint (<b>diff</b>). A colleague checks that the drawing is valid (<b>commit check</b>). Only then do you replace the blueprint, and you agree with the site manager that if you do not phone back within two minutes, the old blueprint is put back (<b>commit confirmed</b>). A <b>lock</b> is a sign on the tracing paper: someone is drawing here.</p>
`+n(`The safe-change loop. Steps 1 to 4 touch only the candidate; step 5 makes the change live with a timer; step 7 makes it permanent.`,`any failure: rollback(), never confirm, always unlock()`,`healthy: confirm`)+`
<h3>The loop in one listing</h3>
<p>This is the whole module in a dozen lines. Every chapter after this one is one of these lines, taken apart.</p>
<pre class="code"><span class="c"># the shape of every safe Junos change (the complete, working push.py is in chapter 9)</span>
dev = connect("J1")
cu = Config(dev)
cu.lock()
try:
    cu.load(text, format="set", merge=True)
    print(cu.diff())
    cu.commit_check()
    cu.commit(confirm=2, comment="NK-2001")
    ok, why = healthy(dev)
    if ok:
        cu.commit(comment="NK-2001 confirmed")
except (ConfigLoadError, CommitError):
    cu.rollback()
finally:
    cu.unlock()</pre>
<p>Look at what happens on each path. If the load fails, the router refuses and <code>rollback()</code> clears the half-loaded candidate. If the check fails, the same. If the commit succeeds but <code>healthy()</code> says no, the script simply does not confirm, and the timer undoes the change. In every case <code>finally</code> releases the lock.</p>

<h3>The lab</h3>
<table class="cmp"><tr><th>Name</th><th>What it is</th><th>Address</th></tr>
<tr><td>AUTO01</td><td>Ubuntu automation host, user netadmin</td><td>10.99.0.60</td></tr>
<tr><td>J1, J2, J3</td><td>Junos routers, OSPF area 0, full-mesh iBGP in AS 65000</td><td>10.99.0.11, .12, .13</td></tr>
<tr><td>netops / NK@2026</td><td>Super-user on the routers (lab value only)</td><td>NETCONF port 830</td></tr></table>
<p>Lab 1 is a configure lab: you build the safe-change tool, <code>push.py</code>, step by step. Lab 2 is a troubleshoot lab: a night-shift script <code>fleet.py</code> has four unsafe habits and you fix them one at a time.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The routers are simulated Junos devices that answer the same NETCONF requests with the same error texts as real ones for everything used here. The clock is virtual: <code>time.sleep(130)</code> costs no real time, and the routers catch up on your next call. Not everything is modelled: the lab does not react to a wrong BGP <code>peer-as</code> or a wrong MD5 key, so our "bad change" is a renumbered loopback, which it does model. We say so wherever it matters.</p></div>

<div class="scn"><h4>The commit that took the office offline</h4><p>An engineer pasted forty set lines into a router at 11 pm. One line removed the address the NMS used to reach the router. The session survived, so nothing looked wrong, and the engineer went home. At 11:05 the monitoring system lost the device. Nobody could log in until the morning. A commit confirmed with a ten-minute timer would have restored the old address at 11:10, and a script that opens a fresh session before confirming would not have confirmed at all.</p><p><b>Lesson:</b> a change is not finished when the commit returns. It is finished when a new, independent check says the network still works.</p></div>

<div class="iv"><p class="q">"How do you make a configuration change to a Junos router from Python safely?"</p><p>I lock the configuration, load the change into the candidate, read the diff, run commit check, and commit with a confirm timer. Then I run my own health check and send the confirming commit only if it passes. On any error I roll back, and in every case I unlock. The commit confirmed timer is the safety net if my script or my connection dies.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PyEZ <code>Config</code> wraps the Junos candidate, commit and rollback machinery.</li>
<li>The order is lock, load, diff, check, commit with a timer, health check, confirm, unlock.</li>
<li>Loading and diffing change nothing live; only the commit does.</li>
<li>A confirm timer protects you when you cannot protect yourself.</li>
<li>Every failure path ends in rollback and unlock.</li></ul></div>
`,hi:`
<p>Har network engineer ke paas ek kahani hoti hai us change ki jo aadhi raat ko galat ho gaya: prefix list mein typo, management address galti se hata diya, ya kisi colleague ka adhura edit aapke change ke saath commit ho gaya. Sirf script se aap surakshit nahi ho jaate. Script wahi galti das seconds mein bees routers par kar deti hai. Aapko surakshit banati hai woh script jo ek savdhan engineer ki tarah kaam kare: lock leti hai, difference dekhti hai, router se change check karwati hai, undo timer ke saath live karti hai, network dekhti hai, aur tab jaakar permanent karti hai.</p>

<p>Junos is mein khaas taur par achha hai, kyunki operating system candidate configuration, commit model aur rollback history ke around design hua hai. PyEZ <b>Config</b> utility un sab par Python ka handle hai. Yeh module aapko use waise hi use karna sikhata hai jaise ek savdhan engineer karta.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li><code>jnpr.junos.utils.config.Config</code> use karna: lock lena aur chhodna, shared, private ya exclusive mode mein kaam karna.</li>
<li>Configuration ko <b>set</b>, <b>text</b>, <b>XML</b> aur <b>JSON</b> mein load karna, string se ya file se, aur Jinja2 templates se render karna.</li>
<li><b>merge</b>, <b>replace</b> aur <b>override</b> mein chunna, aur jaanna ki kaun sa aapko router se lock-out kar sakta hai.</li>
<li><code>diff()</code> padhna, <code>commit_check()</code> chalana, aur <code>ConfigLoadError</code> aur <code>CommitError</code> samajhna.</li>
<li><code>confirm=</code> ke saath commit karna, apna <code>healthy(dev)</code> check likhna, aur rollback karna, khud ya router se karwakar.</li>
<li>Chaar unsafe push theek karna: lock nahi, check nahi, rollback nahi, replace ki jagah merge.</li>
</ul>

<h3>Prerequisites</h3>
<dl class="terms">
<dt>adv-pyez</dt><dd><code>Device</code> kholna, facts padhna, RPCs bulana, aur connection aur RPC exceptions. Yahan hum <code>Device(...).open()</code> bina dobara sikhaye use karte hain.</dd>
<dt>adv-netconf</dt><dd>Candidate datastore, lock aur confirmed commit protocol level par kya hain. PyEZ wahi NETCONF operations aapke liye bhejta hai, isliye hum dohrane ke bajaye wahan refer karte hain.</dd>
<dt>py-templates</dt><dd>Jinja2 loops aur conditions. Chapter 4 unhe Junos set commands generate karne ke liye dobara use karta hai.</dd>
<dt>py-safepush</dt><dd>Program 1 ki aadat: dry run, backup, diff, verify, roll back. Yeh module wahi aadat hai, bas Junos ki apni machinery ke saath.</dd></dl>

<h3>Analogy: blueprint par tracing paper</h3>
<p><b>Running</b> configuration diwaar par laga approved blueprint hai. <b>Candidate</b> uske upar rakha tracing paper ka sheet hai. Aap apna change paper par banate ho, aur imaarat mein kuch nahi hilta. Aap paper ko blueprint ke saath compare karte ho (<b>diff</b>). Ek colleague dekhta hai ki drawing valid hai (<b>commit check</b>). Tab jaakar aap blueprint badalte ho, aur site manager se tay karte ho ki agar do minute mein aapne phone nahi kiya to purana blueprint wapas laga diya jaayega (<b>commit confirmed</b>). <b>Lock</b> tracing paper par laga board hai: yahan koi drawing bana raha hai.</p>
`+n(`Safe-change loop. Step 1 se 4 sirf candidate ko chhoote hain; step 5 timer ke saath change ko live karta hai; step 7 use permanent karta hai.`,`koi bhi failure: rollback(), confirm kabhi nahi, unlock() hamesha`,`healthy: confirm`)+`
<h3>Ek listing mein poora loop</h3>
<p>Yeh poora module bas kuch lines mein hai. Is chapter ke baad har chapter in lines mein se ek line ko kholkar samjhata hai.</p>
<pre class="code"><span class="c"># the shape of every safe Junos change (the complete, working push.py is in chapter 9)</span>
dev = connect("J1")
cu = Config(dev)
cu.lock()
try:
    cu.load(text, format="set", merge=True)
    print(cu.diff())
    cu.commit_check()
    cu.commit(confirm=2, comment="NK-2001")
    ok, why = healthy(dev)
    if ok:
        cu.commit(comment="NK-2001 confirmed")
except (ConfigLoadError, CommitError):
    cu.rollback()
finally:
    cu.unlock()</pre>
<p>Dekho har raste par kya hota hai. Agar load fail ho, router mana kar deta hai aur <code>rollback()</code> aadhe-load candidate ko saaf kar deta hai. Agar check fail ho, wahi. Agar commit ho jaaye par <code>healthy()</code> na kahe, script bas confirm nahi karti, aur timer change ko undo kar deta hai. Har case mein <code>finally</code> lock chhod deta hai.</p>

<h3>Lab</h3>
<table class="cmp"><tr><th>Naam</th><th>Kya hai</th><th>Address</th></tr>
<tr><td>AUTO01</td><td>Ubuntu automation host, user netadmin</td><td>10.99.0.60</td></tr>
<tr><td>J1, J2, J3</td><td>Junos routers, OSPF area 0, AS 65000 mein full-mesh iBGP</td><td>10.99.0.11, .12, .13</td></tr>
<tr><td>netops / NK@2026</td><td>Routers par super-user (sirf lab value)</td><td>NETCONF port 830</td></tr></table>
<p>Lab 1 configure lab hai: aap safe-change tool <code>push.py</code> step by step banate ho. Lab 2 troubleshoot lab hai: night-shift ki script <code>fleet.py</code> ki chaar unsafe aadatein hain aur aap unhe ek ek karke theek karte ho.</p>

<div class="note"><p><b>Lab mein vs real gear par.</b> Routers simulated Junos devices hain jo yahan use hone wali har cheez ke liye real devices jaise hi NETCONF requests ka jawab dete hain aur wahi error texts dete hain. Clock virtual hai: <code>time.sleep(130)</code> mein real time nahi lagta, aur routers aapki agli call par catch up kar lete hain. Sab kuch model nahi hai: lab galat BGP <code>peer-as</code> ya galat MD5 key par react nahi karta, isliye hamara "bad change" renumbered loopback hai, jo woh model karta hai. Jahan zaroori ho wahan hum yeh batate hain.</p></div>

<div class="scn"><h4>Woh commit jisne office offline kar diya</h4><p>Ek engineer ne raat 11 baje router mein chaalis set lines paste ki. Ek line ne woh address hata diya jisse NMS router tak pahunchta tha. Session zinda raha, isliye kuch galat nahi dikha, aur engineer ghar chala gaya. 11:05 par monitoring system ne device kho diya. Subah tak koi login nahi kar paya. Das minute ke timer wala commit confirmed 11:10 par purana address wapas laga deta, aur jo script confirm se pehle naya session kholti woh confirm hi nahi karti.</p><p><b>Lesson:</b> change tab khatam nahi hota jab commit lautata hai. Tab khatam hota hai jab ek naya, independent check kehta hai ki network ab bhi chalta hai.</p></div>

<div class="iv"><p class="q">"Python se Junos router par configuration change surakshit tareeke se kaise karte ho?"</p><p>Main configuration lock karta hoon, change candidate mein load karta hoon, diff padhta hoon, commit check chalata hoon, aur confirm timer ke saath commit karta hoon. Phir apna health check chalata hoon aur confirming commit tabhi bhejta hoon jab woh pass ho. Kisi bhi error par rollback karta hoon, aur har case mein unlock. Commit confirmed timer safety net hai agar meri script ya connection mar jaaye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PyEZ <code>Config</code> Junos ki candidate, commit aur rollback machinery ko wrap karta hai.</li>
<li>Kram hai lock, load, diff, check, timer ke saath commit, health check, confirm, unlock.</li>
<li>Load aur diff kuch live nahi badalte; sirf commit badalta hai.</li>
<li>Confirm timer tab bachata hai jab aap khud ko nahi bacha sakte.</li>
<li>Har failure path rollback aur unlock par khatam hota hai.</li></ul></div>
`}};export{r as default};