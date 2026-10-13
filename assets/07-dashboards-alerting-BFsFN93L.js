var e={id:`dashboards-alerting`,h:{en:`Dashboards and alerting that people trust`,hi:`Dashboards aur alerting jis par log bharosa karein`},body:{en:`
<p><b>One idea:</b> data nobody looks at is wasted, and alerts nobody trusts are worse than none. A good dashboard answers a question at a glance. A good alert wakes a person only when a person must act.</p>
<h3>What to show: the signals that matter</h3>
<table class="cmp"><tr><th>Signal</th><th>What it tells you</th><th>Typical metric</th></tr><tr><td>Utilisation</td><td>How full is the link</td><td>Bits per second divided by link speed</td></tr><tr><td>Errors</td><td>Is the medium or the optic damaged</td><td>Input errors, CRC errors per second</td></tr><tr><td>Discards</td><td>Are we dropping packets (congestion, policy)</td><td>Output drops per second</td></tr><tr><td>State</td><td>Is the thing up</td><td>Interface oper-status, BGP neighbour state</td></tr><tr><td>Device health</td><td>CPU, memory, temperature, power</td><td>CPU five-second, memory used</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Overview one glance per site to Drill down device, interface to Evidence raw counters, logs"><rect x="20" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Overview</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">one glance per site</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><rect x="231" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Drill down</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">device, interface</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><rect x="442" y="40" width="177" height="76" rx="10" fill="#ddd6fe"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">raw counters, logs</text></svg><p class="cap">Dashboards work in layers: a green or red overview, a drill-down per device, then the raw evidence.</p></div>
<ul><li><b>One question per panel.</b> A panel titled "Uplink utilisation, percent" is clear; a panel with eight unrelated lines is not.</li><li><b>Use rates and percentages</b>, not raw ever-growing counters. Show the unit in the title.</li><li><b>Show the threshold line</b> on the graph so everyone sees how close you are.</li><li><b>Put time ranges and refresh rate in view.</b> A graph without the time axis is a rumour.</li></ul>
<h3>Alerts: threshold, duration, severity, runbook</h3>
<p>An alert rule has a <b>condition</b> (a query and a threshold), a <b>duration</b> (how long it must stay true), a <b>severity</b> and a <b>runbook</b> (what the responder should do first). The duration is the cure for noise: a utilisation spike of one minute is normal, but eighty-five percent for ten minutes is a capacity problem. The next code shows the idea in plain Python with made-up data. It counts consecutive samples above a threshold and fires only when the run reaches the required length.</p>
<pre class="code"><span class="c"># Teaching data (made up): utilisation percent, one sample per minute</span>
samples = [40, 91, 55, 88, 90, 92, 87, 89, 91, 90, 93, 94, 60, 50]

THRESHOLD = 85
FOR_MINUTES = 5

run_length = 0
for minute, value in enumerate(samples):
    if value &gt; THRESHOLD:
        run_length += 1
    else:
        run_length = 0
    if run_length == FOR_MINUTES:
        print(f"ALERT at minute {minute}: above {THRESHOLD} percent for {FOR_MINUTES} minutes in a row")

print("single spikes ignored:", [m for m, v in enumerate(samples) if v &gt; THRESHOLD][:1])</pre>
<pre class="out">ALERT at minute 7: above 85 percent for 5 minutes in a row
single spikes ignored: [1]</pre>
<p><code>enumerate(samples)</code> gives each value with its position (the minute). <code>run_length</code> counts how many in a row are above the threshold; any normal value resets it to zero. The lone 91 at minute 1 never alerts, because the run was only one long. The alert fires once, at the fifth consecutive high sample. The last line is a list comprehension that picks the minutes above 85; we only print the first.</p>
<p>The same logic written for Prometheus (reference only) uses <code>for: 10m</code> for the duration and labels and annotations for severity and runbook. The metric names are illustrative; yours depend on your collector.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
groups:
  - name: network-interfaces
    rules:
      - alert: UplinkHighUtilisation
        expr: (rate(interface_in_octets{role="uplink"}[5m]) * 8) / interface_speed_bps{role="uplink"} &gt; 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Uplink above 85 percent for 10 minutes"
          runbook: "Check top talkers, then QoS and capacity plan"</pre>
<h3>Avoiding alert fatigue</h3>
<ul><li><b>Alert on symptoms people feel</b> (loss, errors, a site down) and keep causes (high CPU on one box) on dashboards unless they predict an outage.</li><li><b>Group</b> related alerts so one failed router does not send 48 interface alerts.</li><li><b>Route by severity.</b> Critical pages someone now; warning creates a ticket for the morning.</li><li><b>Review monthly.</b> An alert that fired and needed no action should be changed or deleted.</li><li><b>Alert on missing data.</b> If a device stops streaming, silence is dangerous. A "no data for 5 minutes" alert catches broken subscriptions (chapter 8).</li></ul>
<div class="warn"><p><b>Common mistake.</b> Setting a threshold from a guess. Use a baseline from real data: look at normal weeks, then set the threshold above the usual peak with a duration that filters noise.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the parts of an alert (condition, duration, severity, runbook), why duration reduces noise, that symptom-based alerts beat cause-based ones, and why you alert on missing telemetry.</p></div>
<div class="scn"><h4>Two hundred alerts at 3 a.m.</h4><p>An upstream router failed and every dependent switch raised "interface down" and "BGP neighbour down" alerts, paging the on-call engineer 200 times. After the review the team kept one critical alert for "site unreachable" with a runbook, turned the rest into dashboard indicators and used grouping so one failure creates one page.</p><p><b>Lesson:</b> Alert on the symptom and group the noise.</p></div>
<div class="iv"><p class="q">"How do you design good alerts from telemetry?"</p><p>I alert on user-visible symptoms such as site unreachable or sustained loss, use a duration so short spikes do not fire, set thresholds from real baselines, attach severity and a runbook, group related alerts, and add a missing-data alert so a broken subscription is noticed. I review alerts monthly and remove those that never need action.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Dashboards answer one question per panel and work in layers.</li><li>An alert needs a condition, a duration, a severity and a runbook.</li><li>Duration filters short spikes; baselines set thresholds.</li><li>Alert on symptoms, group related alerts and route by severity.</li><li>Alert on missing data so silence is not mistaken for health.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> jis data ko koi nahi dekhta woh bekaar hai, aur jin alerts par koi bharosa nahi karta woh na hone se bhi bure hain. Achha dashboard ek nazar mein ek sawaal ka jawab deta hai. Achha alert insaan ko tabhi jagata hai jab insaan ko action lena ho.</p>
<h3>Kya dikhana hai: jo signals matter karte hain</h3>
<table class="cmp"><tr><th>Signal</th><th>Yeh kya batata hai</th><th>Aam metric</th></tr><tr><td>Utilisation</td><td>Link kitna bhara hai</td><td>Bits per second ko link speed se divide</td></tr><tr><td>Errors</td><td>Medium ya optic kharab hai kya</td><td>Input errors, CRC errors per second</td></tr><tr><td>Discards</td><td>Kya hum packets drop kar rahe hain (congestion, policy)</td><td>Output drops per second</td></tr><tr><td>State</td><td>Kya cheez up hai</td><td>Interface oper-status, BGP neighbour state</td></tr><tr><td>Device health</td><td>CPU, memory, temperature, power</td><td>CPU five-second, memory used</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Overview site ka ek nazar to Drill down device, interface to Evidence raw counters, logs"><rect x="20" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Overview</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">site ka ek nazar</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><rect x="231" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Drill down</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">device, interface</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><rect x="442" y="40" width="177" height="76" rx="10" fill="#ddd6fe"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">raw counters, logs</text></svg><p class="cap">Dashboards layers mein kaam karte hain: hara ya laal overview, har device ka drill-down, phir raw evidence.</p></div>
<ul><li><b>Ek panel, ek sawaal.</b> "Uplink utilisation, percent" naam ka panel saaf hai; aath unrelated lines wala panel nahi.</li><li><b>Rates aur percentages use karo</b>, kabhi na rukne wale raw counters nahi. Title mein unit dikhao.</li><li>Graph par <b>threshold line dikhao</b> taaki sabko dikhe aap kitne paas ho.</li><li><b>Time range aur refresh rate nazar ke saamne rakho.</b> Time axis ke bina graph afwah hai.</li></ul>
<h3>Alerts: threshold, duration, severity, runbook</h3>
<p>Alert rule mein ek <b>condition</b> (query aur threshold), ek <b>duration</b> (kitni der true rehna hai), ek <b>severity</b> aur ek <b>runbook</b> (responder ko pehle kya karna hai) hota hai. Duration shor ka ilaaj hai: ek minute ka utilisation spike normal hai, lekin das minute tak pachasi percent capacity problem hai. Agla code made-up data ke saath plain Python mein yahi idea dikhata hai. Yeh threshold se upar lagatar samples gintha hai aur tabhi fire karta hai jab run required length tak pahunche.</p>
<pre class="code"><span class="c"># Teaching data (made up): utilisation percent, one sample per minute</span>
samples = [40, 91, 55, 88, 90, 92, 87, 89, 91, 90, 93, 94, 60, 50]

THRESHOLD = 85
FOR_MINUTES = 5

run_length = 0
for minute, value in enumerate(samples):
    if value &gt; THRESHOLD:
        run_length += 1
    else:
        run_length = 0
    if run_length == FOR_MINUTES:
        print(f"ALERT at minute {minute}: above {THRESHOLD} percent for {FOR_MINUTES} minutes in a row")

print("single spikes ignored:", [m for m, v in enumerate(samples) if v &gt; THRESHOLD][:1])</pre>
<pre class="out">ALERT at minute 7: above 85 percent for 5 minutes in a row
single spikes ignored: [1]</pre>
<p><code>enumerate(samples)</code> har value ko uski position (minute) ke saath deta hai. <code>run_length</code> gintha hai ki lagatar kitne threshold se upar hain; koi bhi normal value ise zero kar deti hai. Minute 1 ka akela 91 kabhi alert nahi deta, kyunki run sirf ek lambi thi. Alert ek baar fire hota hai, paanchwe lagatar high sample par. Aakhri line list comprehension hai jo 85 se upar ke minutes chunti hai; hum sirf pehla print karte hain.</p>
<p>Wahi logic Prometheus ke liye (sirf reference) duration ke liye <code>for: 10m</code> aur severity tatha runbook ke liye labels aur annotations use karta hai. Metric names illustrative hain; aapke collector par depend karte hain.</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
groups:
  - name: network-interfaces
    rules:
      - alert: UplinkHighUtilisation
        expr: (rate(interface_in_octets{role="uplink"}[5m]) * 8) / interface_speed_bps{role="uplink"} &gt; 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Uplink above 85 percent for 10 minutes"
          runbook: "Check top talkers, then QoS and capacity plan"</pre>
<h3>Alert fatigue se bachna</h3>
<ul><li><b>Un symptoms par alert karo jo log mehsoos karte hain</b> (loss, errors, site down) aur causes (ek box par high CPU) dashboards par rakho jab tak woh outage predict na karein.</li><li>Related alerts ko <b>group</b> karo taaki ek failed router 48 interface alerts na bheje.</li><li><b>Severity se route karo.</b> Critical abhi kisi ko page karta hai; warning subah ke liye ticket banata hai.</li><li><b>Mahine mein review karo.</b> Jo alert fire hua aur kisi action ki zaroorat nahi padi use badlo ya hata do.</li><li><b>Missing data par alert karo.</b> Device streaming band kar de to chuppi khatarnak hai. "5 minute se no data" alert toote subscriptions pakadta hai (chapter 8).</li></ul>
<div class="warn"><p><b>Aam galti.</b> Threshold andaze se set karna. Asli data se baseline lo: normal hafte dekho, phir usual peak se upar threshold set karo aur noise filter karne wali duration ke saath.</p></div>
<div class="exam"><p><b>Exam trap.</b> Alert ke parts (condition, duration, severity, runbook) jaano, duration shor kyun kam karti hai, symptom-based alerts cause-based se behtar kyun hain, aur missing telemetry par alert kyun karte hain.</p></div>
<div class="scn"><h4>Raat 3 baje do sau alerts</h4><p>Ek upstream router fail hua aur har dependent switch ne "interface down" aur "BGP neighbour down" alerts uthaye, on-call engineer ko 200 baar page kiya. Review ke baad team ne "site unreachable" ka ek critical alert runbook ke saath rakha, baaki ko dashboard indicators bana diya aur grouping use ki taaki ek failure ek page banaye.</p><p><b>Lesson:</b> Symptom par alert karo aur shor ko group karo.</p></div>
<div class="iv"><p class="q">"Telemetry se achhe alerts kaise design karte ho?"</p><p>Main user-visible symptoms jaise site unreachable ya sustained loss par alert karta hoon, duration use karta hoon taaki chhote spikes fire na karein, thresholds asli baselines se set karta hoon, severity aur runbook jodta hoon, related alerts group karta hoon, aur missing-data alert jodta hoon taaki toota subscription pakda jaaye. Alerts ka mahine mein review karta hoon aur jinhe kabhi action nahi chahiye unhe hata deta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Dashboards ek panel ek sawaal answer karte hain aur layers mein kaam karte hain.</li><li>Alert ko condition, duration, severity aur runbook chahiye.</li><li>Duration chhote spikes filter karti hai; baselines thresholds set karte hain.</li><li>Symptoms par alert karo, related alerts group karo aur severity se route karo.</li><li>Missing data par alert karo taaki chuppi ko theek halat na samjha jaaye.</li></ul></div>
`}};export{e as default};