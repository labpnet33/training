var e={id:`lab-upload-delay`,h:{en:`Lab fa-upload-ts: the logs arrive five minutes late`,hi:`Lab fa-upload-ts: logs paanch minute late aate hain`},body:{en:`
<p>When you post a letter, the postbox is emptied at fixed times. A letter dropped just after the pickup waits for the next one, and nobody is to blame; the schedule is simply slow. Logs from a FortiGate can behave like that letter. The FortiGate writes the log at once but ships it only when the upload schedule says so. This lab teaches you to tell a slow schedule from a broken connection.</p>

<h3>The ticket</h3>
<p>The analyst at Chennai complains that Log View shows the sessions of HQ-FGT with a delay, which is useless for live incidents. The connection and the registration are fine. Your tasks are: look at the upload behaviour of the FortiGate, find the option that batches the logs, switch it to realtime, and then confirm that the waiting logs reach FAZ-1.</p>
<p>The lab topology is small: FAZ-1 (192.0.2.6), HQ-FGT (192.0.2.11), the switch, SRV-WEB (192.0.2.80) and PC-HQ. It is the same one you used in earlier labs.</p>

<h3>Approach, step by step</h3>
<p><b>Step 1: make the symptom visible.</b> From PC-HQ open three web sessions with <code>curl</code> to 192.0.2.80. Search Log View for the traffic logs of HQ-FGT. The honest answer is zero. A beginner now suspects the connection. Do the cheaper test first: <code>execute log fortianalyzer test-connectivity</code> prints Connection: Allow, which tells you that the path is fine and says nothing about timing.</p>
<p><b>Step 2: ask the FortiGate what it is doing.</b> This is the command of chapter 5, <code>diagnose test application miglogd 6</code>. Read three fields, in this order: <code>upload=</code>, <code>queued=</code> and <code>sent(t/u/e)=</code>.</p>
<pre class="out">HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=<span class="hl">5-minute</span> data-path=ok
  registration=registered source=192.0.2.11 <span class="hl">queued=3</span> sent(t/u/e)=<span class="hl">0/0/0</span> lost=0</pre>
<p>This one output tells the whole story. Connected and registered: the path and the registration are fine. Three logs are queued: the sessions were written. Nothing was sent: they are waiting for the batch time. The upload option is the schedule that holds them.</p>

<p><b>Step 3: change the schedule.</b> The upload option is a setting of the logging section on the FortiGate: <code>config log fortianalyzer setting</code>, then <code>set upload-option realtime</code>, then <code>end</code>. Realtime means the FortiGate sends the queue every second. The batch options send at the next multiple of the interval, counted from the moment logging was enabled or the option was changed. A one-minute interval would only shorten the delay, which is not the goal of this ticket.</p>

<p><b>Step 4: prove it.</b> Read miglogd 6 again and search Log View. The queue should be empty and the sent counter should have grown:</p>
<pre class="out">HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: ... upload=realtime data-path=ok
  registration=registered source=192.0.2.11 queued=<span class="hl">0</span> sent(t/u/e)=<span class="hl">6</span>/0/0 lost=0
FAZ-1 # execute fazui logview root HQ-FGT traffic limit 1
<span class="hl">6 logs match, 1 shown (newest first).</span></pre>
<p>Why six and not three? The lab needed web sessions for its check as well, so more sessions were written while you worked; do not worry about the exact number, worry about queued=0 and a Log View that shows logs.</p>

<p><b>Step 5: the receive time.</b> Every log carries two times. Look at one log with <code>limit 1</code> and find the field that holds the time FAZ-1 received it; chapter 2 told you its name. The other time, date and time, is the moment the FortiGate wrote the log. With a 5-minute upload the two differ by up to five minutes.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Batch versus realtime">
<text x="10" y="22" class="svg-ink" font-size="13">5-minute</text>
<line x1="90" y1="18" x2="630" y2="18" stroke="#64748b" stroke-width="2"/>
<circle cx="150" cy="18" r="5" fill="#bae6fd"/><circle cx="210" cy="18" r="5" fill="#bae6fd"/><circle cx="260" cy="18" r="5" fill="#bae6fd"/><rect x="560" y="8" width="60" height="20" rx="4" fill="#fde68a"/><text x="590" y="23" text-anchor="middle" class="svg-ink" font-size="12">upload</text>
<text x="10" y="82" class="svg-ink" font-size="13">realtime</text>
<line x1="90" y1="78" x2="630" y2="78" stroke="#64748b" stroke-width="2"/>
<circle cx="150" cy="78" r="5" fill="#bbf7d0"/><circle cx="210" cy="78" r="5" fill="#bbf7d0"/><circle cx="260" cy="78" r="5" fill="#bbf7d0"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">dots = logs written; with realtime each leaves within about a second</text>
</svg><p class="cap">Batching holds the logs until the next upload time.</p></div>

<div class="warn"><p><b>Common wrong turns.</b> Restarting or re-registering the device, which does not touch the schedule. Setting <code>reliable enable</code>, which changes the transport, not the timing. Editing the FortiAnalyzer when the setting lives on the FortiGate. Expecting a test-connectivity result to show queued logs. Setting 1-minute and calling it fixed.</p></div>

<div class="exam"><p><b>Exam traps.</b> Upload options: realtime, 1-minute, 5-minute. Batching trades delay for less log traffic on a slow link. A queue on the FortiGate holds logs while the FortiAnalyzer is unreachable; in the simulator it holds 1500 and drops older ones, counted as lost. Real-product detail beyond these options is not modelled.</p></div>

<div class="scn"><h4>The slow link at the branch</h4><p>Trichy used a 2 Mbps line, so an engineer once set the upload to 5-minute to save bandwidth. Months later the security team asked for live visibility of that site and found that every incident appeared five minutes late. They did not change the line; they moved the site to a 1-minute upload as a compromise and kept realtime for head office.</p><p><b>Lesson:</b> the upload option is a business choice between speed and bandwidth. Document it per site.</p></div>

<div class="iv"><p class="q">"Logs appear in FortiAnalyzer several minutes late. How do you diagnose it?"</p><p>I confirm that the connection and registration are fine, then read the miglogd output on the FortiGate: a batch upload option with queued logs and nothing sent explains it. I compare the log time with the receive time to prove the delay and switch the site to realtime or decide a shorter interval together with the network team.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Late logs are a schedule problem, not a connection problem, when the connection is Allow.</li>
<li>miglogd 6 shows upload, queued and sent in one view.</li>
<li>Realtime sends every second; 1-minute and 5-minute send at interval boundaries.</li>
<li>The setting is on the FortiGate in the logging section, not on the FortiAnalyzer.</li>
<li>The receive time minus the log time is the measured delay.</li>
</ul></div>
`,hi:`
<p>Chitthi postbox mein daalte ho to postbox fixed times par khaali hota hai. Pickup ke turant baad daali chitthi agle pickup tak wait karti hai, aur kisi ki galti nahi; schedule hi slow hai. FortiGate ke logs us chitthi jaise behave kar sakte hain. FortiGate log turant likh deta hai par bhejta tabhi hai jab upload schedule kahe. Ye lab aapko sikhata hai ki slow schedule aur toote hue connection mein farak kaise karein.</p>

<h3>Ticket</h3>
<p>Chennai ka analyst shikayat karta hai ki Log View HQ-FGT ke sessions delay se dikhata hai, jo live incidents ke liye bekaar hai. Connection aur registration theek hain. Aapke tasks hain: FortiGate ka upload behaviour dekho, wo option dhoondho jo logs ko batch karta hai, use realtime karo, aur confirm karo ki waiting logs FAZ-1 tak pahunch gaye.</p>
<p>Lab topology chhoti hai: FAZ-1 (192.0.2.6), HQ-FGT (192.0.2.11), switch, SRV-WEB (192.0.2.80) aur PC-HQ. Ye wahi hai jo aapne pehle labs mein use ki.</p>

<h3>Approach, step by step</h3>
<p><b>Step 1: symptom visible karo.</b> PC-HQ se <code>curl</code> se 192.0.2.80 par teen web sessions kholo. HQ-FGT ke traffic logs Log View mein search karo. Sach jawab zero hai. Beginner ab connection par shak karta hai. Pehle sasta test karo: <code>execute log fortianalyzer test-connectivity</code> Connection: Allow print karta hai, jo batata hai ki path theek hai aur timing ke baare mein kuch nahi kehta.</p>
<p><b>Step 2: FortiGate se poocho wo kya kar raha hai.</b> Ye chapter 5 ka command hai, <code>diagnose test application miglogd 6</code>. Teen fields is order mein padho: <code>upload=</code>, <code>queued=</code> aur <code>sent(t/u/e)=</code>.</p>
<pre class="out">HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=<span class="hl">5-minute</span> data-path=ok
  registration=registered source=192.0.2.11 <span class="hl">queued=3</span> sent(t/u/e)=<span class="hl">0/0/0</span> lost=0</pre>
<p>Ye ek output poori kahani kehta hai. Connected aur registered: path aur registration theek hain. Teen logs queued hain: sessions likhe gaye the. Kuch sent nahi: wo batch time ka wait kar rahe hain. Upload option wo schedule hai jo unhe rok raha hai.</p>

<p><b>Step 3: schedule badlo.</b> Upload option FortiGate ke logging section ki setting hai: <code>config log fortianalyzer setting</code>, phir <code>set upload-option realtime</code>, phir <code>end</code>. Realtime ka matlab FortiGate queue har second bhejta hai. Batch options us moment se ginke interval ke agle multiple par bhejte hain jab logging enable hui ya option badla. One-minute interval sirf delay chhota karta, jo is ticket ka goal nahi hai.</p>

<p><b>Step 4: prove karo.</b> miglogd 6 dobara padho aur Log View search karo. Queue khaali honi chahiye aur sent counter badhna chahiye:</p>
<pre class="out">HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: ... upload=realtime data-path=ok
  registration=registered source=192.0.2.11 queued=<span class="hl">0</span> sent(t/u/e)=<span class="hl">6</span>/0/0 lost=0
FAZ-1 # execute fazui logview root HQ-FGT traffic limit 1
<span class="hl">6 logs match, 1 shown (newest first).</span></pre>
<p>Teen nahi, chhe kyun? Lab ko apne check ke liye bhi web sessions chahiye the, isliye aapke kaam karte waqt aur sessions likhe gaye; exact number ki chinta mat karo, queued=0 aur logs dikhane wale Log View ki chinta karo.</p>

<p><b>Step 5: receive time.</b> Har log mein do times hote hain. <code>limit 1</code> se ek log dekho aur wo field dhoondho jisme FAZ-1 ka receive time hai; uska naam chapter 2 ne bataya tha. Doosra time, date aur time, wo moment hai jab FortiGate ne log likha. 5-minute upload ke saath dono mein paanch minute tak ka farak hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Batch versus realtime">
<text x="10" y="22" class="svg-ink" font-size="13">5-minute</text>
<line x1="90" y1="18" x2="630" y2="18" stroke="#64748b" stroke-width="2"/>
<circle cx="150" cy="18" r="5" fill="#bae6fd"/><circle cx="210" cy="18" r="5" fill="#bae6fd"/><circle cx="260" cy="18" r="5" fill="#bae6fd"/><rect x="560" y="8" width="60" height="20" rx="4" fill="#fde68a"/><text x="590" y="23" text-anchor="middle" class="svg-ink" font-size="12">upload</text>
<text x="10" y="82" class="svg-ink" font-size="13">realtime</text>
<line x1="90" y1="78" x2="630" y2="78" stroke="#64748b" stroke-width="2"/>
<circle cx="150" cy="78" r="5" fill="#bbf7d0"/><circle cx="210" cy="78" r="5" fill="#bbf7d0"/><circle cx="260" cy="78" r="5" fill="#bbf7d0"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">dots = likhe gaye logs; realtime mein har log lagbhag ek second mein nikalta hai</text>
</svg><p class="cap">Batching logs ko agle upload time tak rokta hai.</p></div>

<div class="warn"><p><b>Common wrong turns.</b> Device ko restart ya re-register karna, jo schedule ko nahi chhuta. <code>reliable enable</code> karna, jo transport badalta hai, timing nahi. FortiAnalyzer edit karna jabki setting FortiGate par hai. Ye expect karna ki test-connectivity queued logs dikhayega. 1-minute set karke use fixed bol dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Upload options: realtime, 1-minute, 5-minute. Batching slow link par delay ke badle kam log traffic deta hai. FortiGate par queue logs ko tab rakhti hai jab FortiAnalyzer unreachable ho; simulator mein wo 1500 rakhti hai aur purane drop karti hai, jo lost count hote hain. In options ke aage ki real-product detail model nahi hai.</p></div>

<div class="scn"><h4>Branch ki slow link</h4><p>Trichy 2 Mbps line use karta tha, to ek engineer ne bandwidth bachane ke liye upload 5-minute kar diya tha. Mahino baad security team ne us site ki live visibility maangi aur dekha ki har incident paanch minute late dikhta hai. Unhone line nahi badli; site ko compromise mein 1-minute upload par kiya aur head office ke liye realtime rakha.</p><p><b>Lesson:</b> upload option speed aur bandwidth ke beech ka business choice hai. Use har site ke liye document karo.</p></div>

<div class="iv"><p class="q">"FortiAnalyzer mein logs kai minute late aate hain. Diagnose kaise karoge?"</p><p>Main confirm karta hoon ki connection aur registration theek hain, phir FortiGate par miglogd output padhta hoon: queued logs aur kuch sent nahi ke saath batch upload option ise explain karta hai. Log time ko receive time se compare karke delay prove karta hoon aur site ko realtime par karta hoon ya network team ke saath chhota interval decide karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connection Allow ho to late logs schedule problem hain, connection problem nahi.</li>
<li>miglogd 6 upload, queued aur sent ek view mein dikhata hai.</li>
<li>Realtime har second bhejta hai; 1-minute aur 5-minute interval boundaries par bhejte hain.</li>
<li>Setting FortiGate par logging section mein hai, FortiAnalyzer par nahi.</li>
<li>Receive time minus log time measured delay hai.</li>
</ul></div>
`}};export{e as default};