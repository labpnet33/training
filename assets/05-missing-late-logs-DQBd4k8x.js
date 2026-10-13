var e={id:`missing-late-logs`,h:{en:`Missing and late logs`,hi:`Missing aur late logs`},body:{en:`
<p>Think of a courier chain: the sender must write the parcel, the local office must accept it, the van must leave, and the depot must receive it. If a parcel is missing you do not shout at the depot; you walk the chain from the beginning. A log travels a similar chain, and "missing" or "late" always means that one link is broken or slow.</p>

<h3>The chain, link by link</h3>
<ol>
<li><b>The policy writes the log.</b> The setting <code>logtraffic</code> of a firewall policy has three values: <code>disable</code> (no traffic logs), <code>utm</code> (log only sessions where a security profile produced an event) and <code>all</code> (log every session).</li>
<li><b>The filter lets it through.</b> <code>config log fortianalyzer filter</code> has <code>forward-traffic</code> and a <code>severity</code>. A log passes only if its level is at least as severe as the setting. Traffic logs are level notice, event logs information, so a severity of warning hides both.</li>
<li><b>Sessions that match no policy.</b> The built-in implicit deny drops them, and it logs them only if <code>fwpolicy-implicit-log</code> is enabled under <code>config log setting</code>.</li>
<li><b>The queue and the upload.</b> The FortiGate keeps logs in a queue and sends them according to <code>upload-option</code>: <code>realtime</code> (every second), <code>1-minute</code> or <code>5-minute</code>. If the FortiAnalyzer is unreachable, logs wait in the queue; the queue holds 1500 logs in the simulator, and older ones are dropped and counted as lost.</li>
<li><b>The transport.</b> With <code>reliable disable</code> logs go over UDP port 514; a firewall that blocks UDP but allows TCP leaves the connection check green while logs are lost. <code>reliable enable</code> uses TCP.</li>
<li><b>Registration.</b> An unregistered device has its logs discarded (previous module).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Log chain with failure points">
<rect x="8" y="35" width="100" height="60" rx="8" fill="#bae6fd"/><text x="58" y="62" text-anchor="middle" class="svg-ink" font-size="12">1 policy</text><text x="58" y="80" text-anchor="middle" class="svg-muted" font-size="12">logtraffic</text>
<rect x="128" y="35" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="178" y="62" text-anchor="middle" class="svg-ink" font-size="12">2 filter</text><text x="178" y="80" text-anchor="middle" class="svg-muted" font-size="12">severity</text>
<rect x="248" y="35" width="100" height="60" rx="8" fill="#fde68a"/><text x="298" y="62" text-anchor="middle" class="svg-ink" font-size="12">3 queue</text><text x="298" y="80" text-anchor="middle" class="svg-muted" font-size="12">upload-option</text>
<rect x="368" y="35" width="100" height="60" rx="8" fill="#fed7aa"/><text x="418" y="62" text-anchor="middle" class="svg-ink" font-size="12">4 transport</text><text x="418" y="80" text-anchor="middle" class="svg-muted" font-size="12">UDP or TCP</text>
<rect x="488" y="35" width="142" height="60" rx="8" fill="#bbf7d0"/><text x="559" y="62" text-anchor="middle" class="svg-ink" font-size="12">5 FAZ-1 stores</text><text x="559" y="80" text-anchor="middle" class="svg-muted" font-size="12">registered?</text>
<line x1="108" y1="65" x2="128" y2="65" stroke="#64748b" stroke-width="2"/><line x1="228" y1="65" x2="248" y2="65" stroke="#64748b" stroke-width="2"/><line x1="348" y1="65" x2="368" y2="65" stroke="#64748b" stroke-width="2"/><line x1="468" y1="65" x2="488" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">missing = broken link, late = slow link (mostly 3)</text>
</svg><p class="cap">Walk the chain from the policy to the FortiAnalyzer.</p></div>

<h3>A hidden default: show does not show it</h3>
<p>FortiOS hides settings that have their default value. The default of <code>logtraffic</code> is <code>utm</code>, so a plain <code>show</code> of a policy does not print the line at all. You must use <code>show full-configuration</code>:</p>
<pre class="out">TRY-FGT # show firewall policy 1
    set action accept
    set service "ALL"
    set nat enable                   <span class="c">(no logtraffic line)</span>

TRY-FGT # show full-configuration firewall policy 1
    set utm-status disable
    <span class="hl">set logtraffic utm</span>

HQ-FGT # show full-configuration firewall policy 1
    <span class="hl">set logtraffic all</span></pre>
<p>A policy without security profiles and with <code>utm</code> produces no traffic log, because no profile ever produces an event. This is the classic "registered and connected but no traffic logs" case.</p>

<h3>Late logs: itime and the queue</h3>
<p>If logs are present but late, look at the upload option and the queue with <code>diagnose test application miglogd 6</code>. The output is approximated by the simulator, but the fields are the ones to read: <code>upload</code>, <code>queued</code> and <code>sent(t/u/e)</code> (traffic, UTM, event).</p>
<pre class="out">HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=<span class="hl">5-minute</span> data-path=ok
  registration=registered source=192.0.2.11 queued=<span class="hl">3</span> sent(t/u/e)=0/0/0 lost=0

<span class="c">after: set upload-option realtime</span>
  fortianalyzer: ... upload=realtime data-path=ok
  registration=registered source=192.0.2.11 queued=0 sent(t/u/e)=<span class="hl">6</span>/0/0 lost=0</pre>
<p>Waiting logs leave in a burst when the interval ends or the option changes. The difference between <code>time</code> (when the FortiGate wrote it) and <code>itime</code> (when the FortiAnalyzer received it) is the delay.</p>

<div class="eg"><p><b>Worked example.</b> Three web sessions from PC-HQ. Log View shows nothing. The connection is green and HQ-FGT is registered, so links 5 and 4 are fine. miglogd 6 shows <code>queued=3</code> and an upload of 5-minute: the logs exist and wait in the queue. Switching to realtime sends them within a second.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading only <code>show</code> and concluding that logtraffic is not configured; changing the FortiAnalyzer when the problem is on the FortiGate; setting a severity filter of warning and wondering why traffic logs vanish; forgetting that 1-minute and 5-minute intervals count from the moment logging was enabled or the option was changed.</p></div>

<div class="exam"><p><b>Exam traps.</b> logtraffic: disable, utm, all; utm is the default and logs only security events. Implicit deny logging is a separate switch. Upload options are realtime, 1-minute, 5-minute. Not every real-product detail is modelled; the simulator numbers (queue size, intervals) are stand-ins.</p></div>

<div class="scn"><h4>The delayed incident</h4><p>The Chennai analyst watched Log View for a suspicious host and saw its sessions only after five minutes, long after the user had left. The connection and registration were fine. The upload option on HQ-FGT was 5-minute, a leftover from a bandwidth-saving project on a slow link.</p><p><b>Lesson:</b> for live investigation use realtime and accept the extra log traffic on a fast link.</p></div>

<div class="iv"><p class="q">"Traffic logs from one branch are missing although the device is registered. What do you check?"</p><p>The logtraffic value of its policies with show full-configuration (utm versus all), the forward-traffic and severity filter, whether the traffic hits a policy at all, and then the queue and upload option with miglogd 6.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk the chain: policy, filter, queue and upload, transport, registration.</li>
<li>logtraffic utm is the hidden default and logs only security events; all logs every session.</li>
<li>Use show full-configuration to see default values.</li>
<li>A severity filter of warning hides traffic and event logs.</li>
<li>miglogd 6 shows the upload option, queued, sent and lost counters.</li>
</ul></div>
`,hi:`
<p>Courier chain socho: sender ko parcel likhna hota hai, local office ko accept karna hota hai, van ko nikalna hota hai, aur depot ko receive karna hota hai. Parcel missing ho to depot par chillate nahi; aap chain ko shuru se chalte ho. Log bhi aisi hi chain se guzarta hai, aur "missing" ya "late" ka matlab hamesha ye hai ki koi ek link toota hai ya slow hai.</p>

<h3>Chain, link by link</h3>
<ol>
<li><b>Policy log likhti hai.</b> Firewall policy ki <code>logtraffic</code> setting ki teen values hain: <code>disable</code> (koi traffic log nahi), <code>utm</code> (sirf wo sessions log karo jahan security profile ne event banaya) aur <code>all</code> (har session log karo).</li>
<li><b>Filter jaane deta hai.</b> <code>config log fortianalyzer filter</code> mein <code>forward-traffic</code> aur <code>severity</code> hai. Log tabhi pass hota hai jab uska level setting jitna ya zyada severe ho. Traffic logs level notice ke hote hain, event logs information ke, isliye severity warning dono chhupa deti hai.</li>
<li><b>Jo sessions kisi policy se match nahi karte.</b> Built-in implicit deny unhe drop karta hai, aur log tabhi karta hai jab <code>config log setting</code> ke andar <code>fwpolicy-implicit-log</code> enabled ho.</li>
<li><b>Queue aur upload.</b> FortiGate logs ko queue mein rakhta hai aur <code>upload-option</code> ke hisaab se bhejta hai: <code>realtime</code> (har second), <code>1-minute</code> ya <code>5-minute</code>. FortiAnalyzer unreachable ho to logs queue mein wait karte hain; simulator mein queue 1500 logs rakhti hai, aur purane drop hokar lost count hote hain.</li>
<li><b>Transport.</b> <code>reliable disable</code> ke saath logs UDP port 514 par jaate hain; jo firewall UDP block karke TCP allow karta hai wo connection check green rakhta hai jabki logs lost hote hain. <code>reliable enable</code> TCP use karta hai.</li>
<li><b>Registration.</b> Unregistered device ke logs discard ho jaate hain (pichla module).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Log chain aur failure points">
<rect x="8" y="35" width="100" height="60" rx="8" fill="#bae6fd"/><text x="58" y="62" text-anchor="middle" class="svg-ink" font-size="12">1 policy</text><text x="58" y="80" text-anchor="middle" class="svg-muted" font-size="12">logtraffic</text>
<rect x="128" y="35" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="178" y="62" text-anchor="middle" class="svg-ink" font-size="12">2 filter</text><text x="178" y="80" text-anchor="middle" class="svg-muted" font-size="12">severity</text>
<rect x="248" y="35" width="100" height="60" rx="8" fill="#fde68a"/><text x="298" y="62" text-anchor="middle" class="svg-ink" font-size="12">3 queue</text><text x="298" y="80" text-anchor="middle" class="svg-muted" font-size="12">upload-option</text>
<rect x="368" y="35" width="100" height="60" rx="8" fill="#fed7aa"/><text x="418" y="62" text-anchor="middle" class="svg-ink" font-size="12">4 transport</text><text x="418" y="80" text-anchor="middle" class="svg-muted" font-size="12">UDP ya TCP</text>
<rect x="488" y="35" width="142" height="60" rx="8" fill="#bbf7d0"/><text x="559" y="62" text-anchor="middle" class="svg-ink" font-size="12">5 FAZ-1 store karta hai</text><text x="559" y="80" text-anchor="middle" class="svg-muted" font-size="12">registered?</text>
<line x1="108" y1="65" x2="128" y2="65" stroke="#64748b" stroke-width="2"/><line x1="228" y1="65" x2="248" y2="65" stroke="#64748b" stroke-width="2"/><line x1="348" y1="65" x2="368" y2="65" stroke="#64748b" stroke-width="2"/><line x1="468" y1="65" x2="488" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">missing = toota link, late = slow link (aksar 3)</text>
</svg><p class="cap">Policy se FortiAnalyzer tak chain chalo.</p></div>

<h3>Chhupa hua default: show use nahi dikhata</h3>
<p>FortiOS wo settings chhupa deta hai jinki value default hai. <code>logtraffic</code> ka default <code>utm</code> hai, isliye policy ka plain <code>show</code> wo line print hi nahi karta. Aapko <code>show full-configuration</code> use karna padta hai:</p>
<pre class="out">TRY-FGT # show firewall policy 1
    set action accept
    set service "ALL"
    set nat enable                   <span class="c">(logtraffic line nahi hai)</span>

TRY-FGT # show full-configuration firewall policy 1
    set utm-status disable
    <span class="hl">set logtraffic utm</span>

HQ-FGT # show full-configuration firewall policy 1
    <span class="hl">set logtraffic all</span></pre>
<p>Jis policy mein security profiles nahi hain aur <code>utm</code> hai wo traffic log nahi banati, kyunki koi profile kabhi event nahi banata. Yahi classic "registered aur connected par traffic logs nahi" case hai.</p>

<h3>Late logs: itime aur queue</h3>
<p>Logs hain par late hain to <code>diagnose test application miglogd 6</code> se upload option aur queue dekho. Output simulator approximate karta hai, par jo fields padhne hain wahi hain: <code>upload</code>, <code>queued</code> aur <code>sent(t/u/e)</code> (traffic, UTM, event).</p>
<pre class="out">HQ-FGT # diagnose test application miglogd 6
  fortianalyzer: server=192.0.2.6:514 status=connected mode=udp upload=<span class="hl">5-minute</span> data-path=ok
  registration=registered source=192.0.2.11 queued=<span class="hl">3</span> sent(t/u/e)=0/0/0 lost=0

<span class="c">baad mein: set upload-option realtime</span>
  fortianalyzer: ... upload=realtime data-path=ok
  registration=registered source=192.0.2.11 queued=0 sent(t/u/e)=<span class="hl">6</span>/0/0 lost=0</pre>
<p>Waiting logs interval khatam hone par ya option badalne par ek burst mein nikalte hain. <code>time</code> (FortiGate ne kab likha) aur <code>itime</code> (FortiAnalyzer ne kab receive kiya) ka farak hi delay hai.</p>

<div class="eg"><p><b>Worked example.</b> PC-HQ se teen web sessions. Log View kuch nahi dikhata. Connection green hai aur HQ-FGT registered hai, to links 5 aur 4 theek hain. miglogd 6 <code>queued=3</code> aur upload 5-minute dikhata hai: logs exist karte hain aur queue mein wait kar rahe hain. Realtime karne par wo ek second ke andar chale jaate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sirf <code>show</code> padhkar maan lena ki logtraffic configured nahi hai; problem FortiGate par ho aur FortiAnalyzer badalna; severity filter warning karke sochna ki traffic logs kyun gayab hain; ye bhoolna ki 1-minute aur 5-minute intervals us moment se ginte hain jab logging enable hui ya option badla.</p></div>

<div class="exam"><p><b>Exam traps.</b> logtraffic: disable, utm, all; utm default hai aur sirf security events log karta hai. Implicit deny logging alag switch hai. Upload options realtime, 1-minute, 5-minute hain. Real product ki har detail model nahi hai; simulator ke numbers (queue size, intervals) stand-ins hain.</p></div>

<div class="scn"><h4>Late pahunchi incident</h4><p>Chennai ke analyst ne suspicious host ke liye Log View dekha aur uske sessions paanch minute baad dikhe, jab user kab ka ja chuka tha. Connection aur registration theek the. HQ-FGT par upload option 5-minute tha, slow link par bandwidth bachane wale ek purane project ka bacha hua.</p><p><b>Lesson:</b> live investigation ke liye realtime use karo aur fast link par extra log traffic accept karo.</p></div>

<div class="iv"><p class="q">"Ek branch ke traffic logs missing hain jabki device registered hai. Aap kya check karte ho?"</p><p>Uski policies ka logtraffic value show full-configuration se (utm versus all), forward-traffic aur severity filter, traffic kisi policy se hit hota hai ya nahi, aur phir miglogd 6 se queue aur upload option.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain chalo: policy, filter, queue aur upload, transport, registration.</li>
<li>logtraffic utm chhupa default hai aur sirf security events log karta hai; all har session log karta hai.</li>
<li>Default values dekhne ke liye show full-configuration use karo.</li>
<li>Severity filter warning traffic aur event logs chhupa deta hai.</li>
<li>miglogd 6 upload option, queued, sent aur lost counters dikhata hai.</li>
</ul></div>
`}};export{e as default};