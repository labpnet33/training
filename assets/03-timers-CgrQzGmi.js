var e=(e,t)=>`<rect x="`+(20+e*38)+`" y="40" width="30" height="30" rx="6" fill="`+(t?`#bbf7d0`:`#fecaca`)+`"/><text x="`+(35+e*38)+`" y="60" text-anchor="middle" class="svg-ink" font-size="12">`+(t?`ok`:`x`)+`</text>`,t=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,n=n=>{let r=``;return[1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1].forEach((t,n)=>{r+=e(n,t)}),r+=`<line x1="240" y1="30" x2="240" y2="85" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="200" y="100" text-anchor="middle" class="svg-accent" font-size="12">`+n[0]+`</text>`,r+=`<line x1="316" y1="30" x2="316" y2="85" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="400" y="100" text-anchor="middle" class="svg-accent" font-size="12">`+n[1]+`</text>`,r+=`<text x="20" y="25" class="svg-muted" font-size="12">`+n[2]+`</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">`+n[3]+`</text>`,t(150,r,n[4])},r=`<pre class="code">! Try it: lab "The member that dies every few seconds"
config system sdwan
    config health-check
        edit "VOICE-PROBE"
            set server "10.255.0.1"
            set protocol ping
            set interval 500
            set probe-timeout 500
            set failtime 3
            set recoverytime 10
            set members 1 2
        next
    end
end</pre>`,i={id:`timers`,h:{en:`Probe timing: interval, probe-timeout, failtime and recoverytime`,hi:`Probe timing: interval, probe-timeout, failtime aur recoverytime`},body:{en:`
<p>Four numbers decide how fast SD-WAN notices a failure and how stable the decision is. Think of a smoke alarm. If it is too sensitive it screams at toast; if it is too relaxed the kitchen is on fire before it speaks. The art is a fast reaction to real failures and a calm reaction to blips.</p>
<h3>The four timers</h3>
<table class="cmp"><tr><th>CLI setting</th><th>GUI wording</th><th>Meaning</th><th>Default</th></tr>
<tr><td><code>interval</code></td><td>Check interval</td><td>Milliseconds between probes sent to the server.</td><td>500 ms</td></tr>
<tr><td><code>probe-timeout</code></td><td>Probe timeout</td><td>How long to wait for an answer before the probe counts as lost, in milliseconds.</td><td>500 ms</td></tr>
<tr><td><code>failtime</code></td><td>Failures before inactive</td><td>Consecutive lost probes before the member is declared dead.</td><td>5</td></tr>
<tr><td><code>recoverytime</code></td><td>Restore link after</td><td>Consecutive good probes before a dead member is alive again.</td><td>5</td></tr></table>
<p>The defaults above are what I know for recent releases; confirm with <code>get</code> inside the health check on your unit. Allowed ranges are wide, for example an interval from tens of milliseconds up to an hour.</p>
`+n([`3 lost: not yet`,`dead after failtime`,`Each box is one probe, sent every interval.`,`Recovery needs recoverytime good probes in a row; here 5.`,`With failtime 5 the member turns dead on the fifth lost probe, not on the first. Good probes reset the count.`])+`
<h3>Detection time: the formula</h3>
<p><b>Detection time is roughly interval x failtime.</b> A probe is declared lost when its answer has not arrived within the probe timeout, so keep the timeout no longer than the interval (otherwise probes overlap and your numbers blur). Recovery time is roughly interval x recoverytime.</p>
<table class="cmp"><tr><th>interval</th><th>failtime</th><th>Dead after about</th><th>Typical use</th></tr>
<tr><td>500 ms</td><td>3</td><td>1.5 s</td><td>Voice-critical overlay</td></tr>
<tr><td>500 ms</td><td>5</td><td>2.5 s</td><td>The default; fast, a bit sensitive</td></tr>
<tr><td>1000 ms</td><td>5</td><td>5 s</td><td>General branch internet</td></tr>
<tr><td>5000 ms</td><td>3</td><td>15 s</td><td>Low-priority or metered LTE link</td></tr>
<tr><td>120000 ms</td><td>5</td><td>10 min</td><td>Background checks such as the built-in Default ones</td></tr></table>
<h3>Why recovery should be slower than failure</h3>
<p>A link that is flaky will drop and return again and again. If recovery is as quick as failure, the member flips between alive and dead, and every flip can move sessions or routes. A common pattern is <b>fast to fail, slow to trust</b>: failtime 3, recoverytime 10 as in the configuration below.</p>
`+r+`
<div class="eg"><p><b>Worked example: flapping.</b> An LTE link drops one probe every few seconds in a poor-signal spot. With interval 500 ms, failtime 2 and recoverytime 2, it would be declared dead after 1 second of loss and alive after 1 second of success, flipping dozens of times an hour. With failtime 4 and recoverytime 10, a single lost probe never reaches the threshold, and the link only changes state after 2 seconds of solid loss or 5 seconds of solid success. The user sees steady voice instead of constant switching.</p></div>
<h3>The cost of probing</h3>
<p>Probes are tiny, but numbers add up at a hub. One probe every 500 ms is 2 probes per second per member per health check. A hub that receives checks from 200 branches over 4 tunnels each, with one check, sees 200 x 4 x 2 = 1,600 probes per second. At about 100 bytes each, that is roughly 160 kilobytes per second, about 1.3 Mbit/s, plus the CPU for answering them. That is fine, but ten health checks with TWAMP would be ten times larger: probe only as often as the decision needs.</p>
<h3>Actions when a member is declared dead</h3>
<p>The GUI offers an option often written <b>Update static route</b> (CLI <code>update-static-route</code>). When on, static routes that depend on the dead member are taken out of the routing table, so the routing table agrees with the SD-WAN state. Another cascade option can bring interfaces down together when a member fails. Check <code>set ?</code> for the exact options on your firmware. A rule can also add a <b>hold-down-time</b> so that a recovered member is not used again immediately; that belongs to rules and is covered in <b>fsd-rules</b>.</p>
<div class="warn"><p><b>Common mistake.</b> Setting a very aggressive interval and a tiny failtime on every health check "for fast failover". The result is flapping on normal internet noise, extra CPU on hubs, and failovers that are caused by the monitoring itself.</p></div>
<div class="exam"><p><b>Exam trap.</b> Detection time is interval x failtime, not failtime alone, and not the probe timeout. A question that gives interval 1000 ms and failtime 5 expects about 5 seconds. Recovery is interval x recoverytime.</p></div>
<div class="scn"><h4>The failover that took thirty seconds</h4><p>A branch used a probe interval of 5 seconds with failtime 6 to save bandwidth on a metered LTE backup. When the primary fibre was cut, voice calls dropped for about 30 seconds before SD-WAN switched. After changing the primary link's check to 500 ms with failtime 3 (about 1.5 seconds) and leaving the LTE check slow, calls survived a cut with a short glitch.</p><p><b>Lesson:</b> Tune each check to the link it protects: fast for the primary path, slow for the metered backup.</p></div>
<div class="iv"><p class="q">"How long does SD-WAN take to detect a dead link, and how would you make it faster without causing flapping?"</p><p>Roughly interval times failtime, for example 500 ms x 5 is 2.5 s. To be faster I lower failtime to 3 or interval to 500 ms for the critical path only, and keep recovery slower (recoverytime 10) so a flaky link does not flip. I confirm with test failures and the sla log.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Four timers: interval, probe-timeout, failtime, recoverytime.</li><li>Detection time is about interval x failtime; recovery about interval x recoverytime.</li><li>Keep the probe timeout within the interval; make recovery slower than failure.</li><li>Probe load adds up at hubs; tune each check to the link it protects.</li><li>Update-static-route keeps the routing table consistent with the SD-WAN state.</li></ul></div>
`,hi:`
<p>Chaar numbers tay karte hain ki SD-WAN failure kitni jaldi notice karta hai aur decision kitna stable hai. Smoke alarm socho. Bahut sensitive ho to toast par chillata hai; bahut dheela ho to bolne se pehle kitchen jal chuka hota hai. Kala yeh hai: asli failures par tez reaction aur chhote blips par shaant reaction.</p>
<h3>Chaar timers</h3>
<table class="cmp"><tr><th>CLI setting</th><th>GUI wording</th><th>Matlab</th><th>Default</th></tr>
<tr><td><code>interval</code></td><td>Check interval</td><td>Server ko bheje gaye probes ke beech milliseconds.</td><td>500 ms</td></tr>
<tr><td><code>probe-timeout</code></td><td>Probe timeout</td><td>Probe ko lost maanne se pehle jawab ka kitna intezaar, milliseconds mein.</td><td>500 ms</td></tr>
<tr><td><code>failtime</code></td><td>Failures before inactive</td><td>Member ko dead declare karne se pehle lagataar lost probes.</td><td>5</td></tr>
<tr><td><code>recoverytime</code></td><td>Restore link after</td><td>Dead member ke phir alive hone se pehle lagataar achhe probes.</td><td>5</td></tr></table>
<p>Upar ke defaults woh hain jo mujhe recent releases ke liye pata hain; apni unit par health check ke andar <code>get</code> se confirm karo. Allowed ranges chaude hain, jaise interval kuch dus milliseconds se ek ghante tak.</p>
`+n([`3 lost: abhi nahi`,`failtime ke baad dead`,`Har box ek probe hai, har interval par bheja jaata hai.`,`Recovery ko lagataar recoverytime achhe probes chahiye; yahan 5.`,`failtime 5 ke saath member paanchwe lost probe par dead hota hai, pehle par nahi. Achhe probes count reset kar dete hain.`])+`
<h3>Detection time: formula</h3>
<p><b>Detection time lagbhag interval x failtime hota hai.</b> Probe tab lost maana jaata hai jab uska jawab probe timeout ke andar nahi aaya, isliye timeout ko interval se lamba mat rakho (warna probes overlap hote hain aur numbers dhundhle ho jaate hain). Recovery time lagbhag interval x recoverytime hota hai.</p>
<table class="cmp"><tr><th>interval</th><th>failtime</th><th>Dead lagbhag</th><th>Typical use</th></tr>
<tr><td>500 ms</td><td>3</td><td>1.5 s</td><td>Voice-critical overlay</td></tr>
<tr><td>500 ms</td><td>5</td><td>2.5 s</td><td>Default; tez, thoda sensitive</td></tr>
<tr><td>1000 ms</td><td>5</td><td>5 s</td><td>General branch internet</td></tr>
<tr><td>5000 ms</td><td>3</td><td>15 s</td><td>Low-priority ya metered LTE link</td></tr>
<tr><td>120000 ms</td><td>5</td><td>10 min</td><td>Background checks jaise built-in Default wale</td></tr></table>
<h3>Recovery failure se dheemi kyun honi chahiye</h3>
<p>Flaky link baar-baar girti aur wapas aati hai. Agar recovery failure jitni tez ho, to member alive aur dead ke beech flip karta hai, aur har flip sessions ya routes ko move kar sakta hai. Aam pattern hai <b>failure mein tez, bharose mein dheema</b>: failtime 3, recoverytime 10, jaisa neeche ki configuration mein hai.</p>
`+r+`
<div class="eg"><p><b>Worked example: flapping.</b> Kharab signal wali jagah ek LTE link har kuch seconds mein ek probe girati hai. Interval 500 ms, failtime 2 aur recoverytime 2 ke saath woh 1 second ke loss ke baad dead aur 1 second ki safalta ke baad alive declare hoti, ghante mein darjano baar flip hoti. failtime 4 aur recoverytime 10 ke saath ek lost probe kabhi threshold tak nahi pahunchta, aur link sirf 2 second ke pakke loss ya 5 second ki pakki safalta ke baad state badalti hai. User ko lagataar switching ki jagah steady voice milti hai.</p></div>
<h3>Probing ki cost</h3>
<p>Probes chhote hain, par hub par numbers jud jaate hain. Har 500 ms mein ek probe matlab har member har health check ke liye 2 probes per second. 200 branches se har ek ke 4 tunnels par ek check ke saath hub 200 x 4 x 2 = 1,600 probes per second dekhta hai. Har ek lagbhag 100 bytes ka ho to lagbhag 160 kilobytes per second, yaani lagbhag 1.3 Mbit/s, plus unka jawab dene ka CPU. Yeh theek hai, par TWAMP wale dus health checks dus guna bade honge: utni hi baar probe karo jitni decision ko zaroorat hai.</p>
<h3>Member dead declare hone par actions</h3>
<p>GUI ek option deta hai jo aksar <b>Update static route</b> likha hota hai (CLI <code>update-static-route</code>). On hone par woh static routes jo dead member par nirbhar hain routing table se nikal diye jaate hain, taaki routing table SD-WAN state se mel khaye. Ek aur cascade option member fail hone par interfaces ko saath mein down kar sakta hai. Apne firmware ke exact options ke liye <code>set ?</code> dekho. Rule <b>hold-down-time</b> bhi jod sakta hai taaki recover hua member turant dobara use na ho; woh rules ka hissa hai aur <b>fsd-rules</b> mein cover hota hai.</p>
<div class="warn"><p><b>Common galti.</b> Har health check par "tez failover" ke liye bahut aggressive interval aur chhota failtime set karna. Result: normal internet noise par flapping, hubs par extra CPU, aur aise failovers jo monitoring ne khud paida kiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Detection time interval x failtime hai, sirf failtime nahi, aur probe timeout nahi. Jo sawal interval 1000 ms aur failtime 5 deta hai woh lagbhag 5 seconds expect karta hai. Recovery interval x recoverytime hai.</p></div>
<div class="scn"><h4>Failover jisme tees second lage</h4><p>Ek branch ne metered LTE backup par bandwidth bachane ke liye probe interval 5 seconds aur failtime 6 rakha. Jab primary fibre kati, voice calls SD-WAN ke switch karne se pehle lagbhag 30 seconds gir gayi. Primary link ka check 500 ms aur failtime 3 (lagbhag 1.5 seconds) kiya aur LTE check dheema chhoda, to calls ek chhote glitch ke saath cut se bach gayi.</p><p><b>Seekh:</b> Har check ko us link ke hisaab se tune karo jise woh bachata hai: primary path ke liye tez, metered backup ke liye dheema.</p></div>
<div class="iv"><p class="q">"SD-WAN dead link ko kitni der mein detect karta hai, aur flapping ke bina use tez kaise karoge?"</p><p>Lagbhag interval guna failtime, jaise 500 ms x 5 yaani 2.5 s. Tez karne ke liye main sirf critical path par failtime 3 ya interval 500 ms karta hoon, aur recovery dheemi rakhta hoon (recoverytime 10) taaki flaky link flip na kare. Main test failures aur sla log se confirm karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Chaar timers: interval, probe-timeout, failtime, recoverytime.</li><li>Detection time lagbhag interval x failtime; recovery lagbhag interval x recoverytime.</li><li>Probe timeout interval ke andar rakho; recovery ko failure se dheemi rakho.</li><li>Hubs par probe load jodta hai; har check ko us link ke hisaab se tune karo jise woh bachata hai.</li><li>Update-static-route routing table ko SD-WAN state ke saath consistent rakhta hai.</li></ul></div>
`}};export{i as default};