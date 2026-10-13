var e={id:`rescue-configuration`,h:{en:`The rescue configuration: your way back`,hi:`Rescue configuration: wapas aane ka raasta`},body:{en:`
<p>Hikers carry a map and also a spare compass in the bottom of the bag, never used, never changed. When everything goes wrong, they know it still works. The <b>rescue configuration</b> is a Junos device's spare compass: a known-good configuration that you saved on purpose and that does not scroll away.</p>

<h3>Rollback files versus the rescue configuration</h3>
<p>Junos stores 50 rollback files (0 to 49). Each commit pushes the older ones down, and rollback 49 falls off the end. After 50 commits, the "good" configuration of last week is gone. The rescue configuration is a separate file, <code>/config/rescue.conf.gz</code>, which never ages out until you replace it.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Rollback files and rescue">
<rect x="20" y="30" width="400" height="50" rx="8" fill="#bae6fd"/><text x="220" y="52" text-anchor="middle" class="svg-ink" font-size="13">rollback 0, 1, 2, ... 49 (shifts on every commit)</text><text x="220" y="70" text-anchor="middle" class="svg-muted" font-size="11">old versions fall off the end</text>
<rect x="450" y="30" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">rescue.conf.gz</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="11">stays until you replace it</text>
<rect x="150" y="110" width="340" height="40" rx="8" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">candidate configuration (load with rollback)</text>
<g stroke="#64748b" stroke-width="2"><line x1="220" y1="80" x2="260" y2="110"/><line x1="535" y1="80" x2="440" y2="110"/></g>
</svg><p class="cap">Both rollback N and rollback rescue load into the candidate; you still commit.</p></div>

<h3>Commands</h3>
<pre class="code">lab@NK-DEL-EDGE&gt; show system alarms
1 alarms currently active
Alarm time               Class  Description
2026-10-01 09:00:03 IST  Minor  Rescue configuration is not set

lab@NK-DEL-EDGE&gt; request system configuration rescue save
lab@NK-DEL-EDGE&gt; show system configuration rescue          <span class="c">! view it</span>
lab@NK-DEL-EDGE&gt; show system alarms
No alarms currently active

lab@NK-DEL-EDGE&gt; configure
lab@NK-DEL-EDGE# rollback rescue                              <span class="c">! load into candidate</span>
load complete
lab@NK-DEL-EDGE# show | compare
lab@NK-DEL-EDGE# commit comment "restore rescue" and-quit
lab@NK-DEL-EDGE&gt; request system configuration rescue delete</pre>
<ul>
<li><code>request system configuration rescue save</code> copies the <b>active</b> configuration into the rescue file. The <i>Rescue configuration is not set</i> alarm (class Minor) disappears.</li>
<li><code>rollback rescue</code> is like <code>rollback N</code>: it changes only the <b>candidate</b>. Commit to apply.</li>
<li>Update it after every planned change that you are happy with, otherwise it will be out of date and restore an old design.</li>
<li>If a router becomes unreachable, a console user can run <code>load override /config/rescue.conf.gz</code>, or from the shell use <code>cli</code> then <code>rollback rescue</code>.</li>
</ul>

<h3>Rescue versus commit confirmed versus rollback 1</h3>
<table class="cmp"><tr><th>Tool</th><th>Best for</th></tr>
<tr><td><code>commit confirmed</code></td><td>a single risky change you can test within minutes</td></tr>
<tr><td><code>rollback 1</code></td><td>undo the last commit</td></tr>
<tr><td><code>rollback N</code></td><td>undo recent history, within 50 commits</td></tr>
<tr><td><code>rollback rescue</code></td><td>return to a deliberately saved baseline after many changes or a lock-out</td></tr></table>

<h3>Lab walkthrough: Delhi edge and the wrong ticket</h3>
<p>NK-DEL-EDGE (R1) links the Delhi office LAN (PC1, 10.90.1.10/24 behind ge-0/0/0 10.90.1.1/24) to the data centre LAN (PC2, 10.90.2.10/24) through R2 (NK-DEL-DC) over 10.90.12.0/30. R1 has a static route to 10.90.2.0/24 via 10.90.12.2. The working configuration is committed as "baseline".</p>
<ol>
<li><b>Prepare.</b> <code>show system alarms</code> shows the Minor rescue alarm. <code>request system configuration rescue save</code> clears it.</li>
<li><b>Apply change ticket NK-4471.</b> The ticket says: replace 10.90.12.1/30 on ge-0/0/1.0 with 10.90.21.1/30. The engineer follows it exactly:
<pre class="code">lab@NK-DEL-EDGE# delete interfaces ge-0/0/1 unit 0 family inet address 10.90.12.1/30
lab@NK-DEL-EDGE# set interfaces ge-0/0/1 unit 0 family inet address 10.90.21.1/30
lab@NK-DEL-EDGE# commit comment "NK-4471"
lab@NK-DEL-EDGE&gt; ping 10.90.12.2 count 2
2 packets transmitted, 0 packets received, <span class="hl">100% packet loss</span></pre>
R2 still uses 10.90.12.2/30, which is not in 10.90.21.0/30 and so is no longer a neighbour; the static route's next hop is unreachable, and PC1 loses PC2.</li>
<li><b>Recover with rescue.</b>
<pre class="code">lab@NK-DEL-EDGE# rollback rescue
load complete
lab@NK-DEL-EDGE# show | compare
[edit interfaces ge-0/0/1 unit 0 family inet]
-       address 10.90.21.1/30;
+       address 10.90.12.1/30;
lab@NK-DEL-EDGE# commit comment "restore rescue" and-quit</pre></li>
<li><b>Verify.</b> PC1 pings 10.90.2.10 successfully; <code>show system commit</code> shows three entries: baseline, NK-4471, restore rescue.</li>
</ol>
<p><code>rollback 1</code> would also have worked here, because only one commit had been made since. The rescue configuration is the answer when "many commits ago" is the last good state, or when you cannot remember how many changes were applied.</p>

<div class="eg"><p><b>Worked example.</b> Over a week five engineers made 60 small commits. On Friday something broke and nobody knows when. Rollback files cover only 50 commits and the good state is in the middle. The rescue configuration saved after the Monday change window is exactly Monday's design. <code>rollback rescue</code>, <code>show | compare</code> to see all week's changes, commit, then re-apply the good ones deliberately.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Never saving a rescue configuration (the alarm sits there for years); saving it while the configuration is broken; forgetting <code>commit</code> after <code>rollback rescue</code>; not refreshing it after a good planned change; confusing <code>load factory-default</code> (which resets to factory) with <code>rollback rescue</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Commands: <code>request system configuration rescue save</code>, <code>rollback rescue</code>, <code>show system configuration rescue</code>, <code>request system configuration rescue delete</code>. Rescue does not age out like rollback files; saving it clears the Minor alarm; like all rollbacks it needs a commit.</p></div>

<div class="scn"><h4>The lock-out in a data centre</h4><p>An engineer applied a firewall filter to the loopback of a data-centre router and blocked SSH from the jump host, including himself. The console server was down. The on-site technician reached the router by console, ran <code>cli</code>, <code>configure</code>, <code>rollback rescue</code> and <code>commit</code>. SSH worked again within three minutes. The rescue file had been saved the previous Tuesday.</p><p><b>Lesson:</b> a fresh rescue file turns a site visit into a console command.</p></div>

<div class="iv"><p class="q">"When would you use the rescue configuration instead of rollback?"</p><p>When the last known-good state is more than a few commits ago, beyond the 50 rollback files, or when someone has locked everyone out. Rescue is a deliberately saved baseline that does not age out. I save it with <code>request system configuration rescue save</code> after every approved change and restore with <code>rollback rescue</code> and a commit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rescue configuration is a saved known-good file that never ages out.</li>
<li><code>request system configuration rescue save</code> saves the active config and clears the Minor alarm.</li>
<li><code>rollback rescue</code> loads it into the candidate; commit to apply.</li>
<li>Refresh the rescue file after each good planned change.</li>
<li>Use commit confirmed for single changes, rollback N for recent history, rescue for baselines.</li>
</ul></div>
`,hi:`
<p>Hikers ke paas map hota hai aur bag ke neeche ek spare compass bhi, jo kabhi use nahi hota, kabhi badla nahi jaata. Jab sab galat ho jaaye to unhe pata hota hai ki woh abhi bhi kaam karta hai. <b>Rescue configuration</b> Junos device ka spare compass hai: ek known-good configuration jo aapne jaan-boojh kar save ki aur jo scroll hokar gayab nahi hoti.</p>

<h3>Rollback files versus rescue configuration</h3>
<p>Junos 50 rollback files (0 se 49) rakhta hai. Har commit purani files ko neeche dhakelta hai, aur rollback 49 aakhir mein gir jaati hai. 50 commits ke baad pichle hafte ki "achhi" configuration chali jaati hai. Rescue configuration alag file hai, <code>/config/rescue.conf.gz</code>, jo aapke replace karne tak purani nahi hoti.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Rollback files aur rescue">
<rect x="20" y="30" width="400" height="50" rx="8" fill="#bae6fd"/><text x="220" y="52" text-anchor="middle" class="svg-ink" font-size="13">rollback 0, 1, 2, ... 49 (har commit par khisakti hain)</text><text x="220" y="70" text-anchor="middle" class="svg-muted" font-size="11">purane versions aakhir mein gir jaate hain</text>
<rect x="450" y="30" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">rescue.conf.gz</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="11">replace karne tak rehti hai</text>
<rect x="150" y="110" width="340" height="40" rx="8" fill="#fde68a"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="13">candidate configuration (rollback se load)</text>
<g stroke="#64748b" stroke-width="2"><line x1="220" y1="80" x2="260" y2="110"/><line x1="535" y1="80" x2="440" y2="110"/></g>
</svg><p class="cap">Rollback N aur rollback rescue dono candidate mein load karte hain; commit phir bhi karna padta hai.</p></div>

<h3>Commands</h3>
<pre class="code">lab@NK-DEL-EDGE&gt; show system alarms
1 alarms currently active
Alarm time               Class  Description
2026-10-01 09:00:03 IST  Minor  Rescue configuration is not set

lab@NK-DEL-EDGE&gt; request system configuration rescue save
lab@NK-DEL-EDGE&gt; show system configuration rescue          <span class="c">! dekho</span>
lab@NK-DEL-EDGE&gt; show system alarms
No alarms currently active

lab@NK-DEL-EDGE&gt; configure
lab@NK-DEL-EDGE# rollback rescue                              <span class="c">! candidate mein load</span>
load complete
lab@NK-DEL-EDGE# show | compare
lab@NK-DEL-EDGE# commit comment "restore rescue" and-quit
lab@NK-DEL-EDGE&gt; request system configuration rescue delete</pre>
<ul>
<li><code>request system configuration rescue save</code> <b>active</b> configuration ko rescue file mein copy karta hai. <i>Rescue configuration is not set</i> alarm (class Minor) hat jaata hai.</li>
<li><code>rollback rescue</code> <code>rollback N</code> jaisa hai: sirf <b>candidate</b> badalta hai. Apply karne ke liye commit karo.</li>
<li>Har santusht planned change ke baad ise update karo, warna yeh purani ho jaati hai aur purana design restore karti hai.</li>
<li>Router unreachable ho jaaye to console user <code>load override /config/rescue.conf.gz</code> chala sakta hai, ya shell se <code>cli</code> phir <code>rollback rescue</code>.</li>
</ul>

<h3>Rescue versus commit confirmed versus rollback 1</h3>
<table class="cmp"><tr><th>Tool</th><th>Kis ke liye best</th></tr>
<tr><td><code>commit confirmed</code></td><td>ek risky change jo minutes mein test ho sake</td></tr>
<tr><td><code>rollback 1</code></td><td>aakhri commit undo karna</td></tr>
<tr><td><code>rollback N</code></td><td>recent history undo karna, 50 commits ke andar</td></tr>
<tr><td><code>rollback rescue</code></td><td>kai changes ya lock-out ke baad jaan-boojh kar save ki baseline par wapas</td></tr></table>

<h3>Lab walkthrough: Delhi edge aur galat ticket</h3>
<p>NK-DEL-EDGE (R1) Delhi office LAN (PC1, 10.90.1.10/24, ge-0/0/0 10.90.1.1/24 ke peeche) ko data centre LAN (PC2, 10.90.2.10/24) se R2 (NK-DEL-DC) ke through 10.90.12.0/30 par jodta hai. R1 ke paas 10.90.2.0/24 ka static route 10.90.12.2 ke through hai. Working configuration "baseline" ke roop mein committed hai.</p>
<ol>
<li><b>Taiyaari.</b> <code>show system alarms</code> Minor rescue alarm dikhata hai. <code>request system configuration rescue save</code> use hata deta hai.</li>
<li><b>Change ticket NK-4471 lagao.</b> Ticket kehta hai: ge-0/0/1.0 par 10.90.12.1/30 ki jagah 10.90.21.1/30 lagao. Engineer bilkul follow karta hai:
<pre class="code">lab@NK-DEL-EDGE# delete interfaces ge-0/0/1 unit 0 family inet address 10.90.12.1/30
lab@NK-DEL-EDGE# set interfaces ge-0/0/1 unit 0 family inet address 10.90.21.1/30
lab@NK-DEL-EDGE# commit comment "NK-4471"
lab@NK-DEL-EDGE&gt; ping 10.90.12.2 count 2
2 packets transmitted, 0 packets received, <span class="hl">100% packet loss</span></pre>
R2 abhi bhi 10.90.12.2/30 use karta hai, jo 10.90.21.0/30 mein nahi hai isliye ab neighbour nahi; static route ka next hop unreachable hai, aur PC1 PC2 ko kho deta hai.</li>
<li><b>Rescue se recover karo.</b>
<pre class="code">lab@NK-DEL-EDGE# rollback rescue
load complete
lab@NK-DEL-EDGE# show | compare
[edit interfaces ge-0/0/1 unit 0 family inet]
-       address 10.90.21.1/30;
+       address 10.90.12.1/30;
lab@NK-DEL-EDGE# commit comment "restore rescue" and-quit</pre></li>
<li><b>Verify.</b> PC1 10.90.2.10 ko successfully ping karta hai; <code>show system commit</code> teen entries dikhata hai: baseline, NK-4471, restore rescue.</li>
</ol>
<p>Yahan <code>rollback 1</code> bhi chalta, kyunki sirf ek commit hua tha. Rescue configuration tab jawab hai jab "kai commits pehle" aakhri achhi state ho, ya yaad na ho ki kitne changes lage.</p>

<div class="eg"><p><b>Worked example.</b> Ek hafte mein paanch engineers ne 60 chhote commits kiye. Friday ko kuch toota aur kisi ko nahi pata kab. Rollback files sirf 50 commits cover karti hain aur achhi state beech mein hai. Monday change window ke baad save ki rescue configuration bilkul Monday ka design hai. <code>rollback rescue</code>, poore hafte ke changes dekhne ke liye <code>show | compare</code>, commit, phir achhe changes ko soch-samajhkar dobara lagao.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Rescue configuration kabhi save na karna (alarm saalon tak pada rehta hai); configuration toot-ne par save karna; <code>rollback rescue</code> ke baad <code>commit</code> bhool jaana; achhe planned change ke baad refresh na karna; <code>load factory-default</code> (factory par reset) ko <code>rollback rescue</code> se confuse karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Commands: <code>request system configuration rescue save</code>, <code>rollback rescue</code>, <code>show system configuration rescue</code>, <code>request system configuration rescue delete</code>. Rescue rollback files ki tarah purani nahi hoti; save karne se Minor alarm hat jaata hai; har rollback ki tarah commit chahiye.</p></div>

<div class="scn"><h4>Data centre mein lock-out</h4><p>Ek engineer ne data-centre router ke loopback par firewall filter lagaya aur jump host se SSH block kar diya, apne aap ko bhi. Console server down tha. On-site technician console se router tak pahuncha, <code>cli</code>, <code>configure</code>, <code>rollback rescue</code> aur <code>commit</code> chalaya. SSH teen minute mein wapas chal gaya. Rescue file pichle Tuesday save hui thi.</p><p><b>Lesson:</b> taazi rescue file site visit ko console command mein badal deti hai.</p></div>

<div class="iv"><p class="q">"Rollback ki jagah rescue configuration kab use karoge?"</p><p>Jab aakhri known-good state kuch commits se zyada pehle ho, 50 rollback files se bahar ho, ya kisi ne sabko lock out kar diya ho. Rescue jaan-boojh kar save ki baseline hai jo purani nahi hoti. Har approved change ke baad <code>request system configuration rescue save</code> se save karta hoon aur <code>rollback rescue</code> aur commit se restore karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rescue configuration saved known-good file hai jo kabhi purani nahi hoti.</li>
<li><code>request system configuration rescue save</code> active config save karta hai aur Minor alarm hataata hai.</li>
<li><code>rollback rescue</code> candidate mein load karta hai; apply karne ke liye commit.</li>
<li>Har achhe planned change ke baad rescue file refresh karo.</li>
<li>Single changes ke liye commit confirmed, recent history ke liye rollback N, baselines ke liye rescue.</li>
</ul></div>
`}};export{e as default};