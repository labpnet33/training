var e={id:`dashboards-and-theory`,h:{en:`Dashboards, scheduled reports and custom design (theory)`,hi:`Dashboards, scheduled reports aur custom design (theory)`},body:{en:`
<div class="note"><p><b>Read this first.</b> Almost everything in this chapter is <b>theory</b>. The simulator does not model dashboards, FortiView, scheduled reports, PDF files, email delivery, custom datasets or custom charts. It has three fixed layouts that you run by hand. We describe the real product briefly so that you know the words and can talk about them in an interview, and we mark every such statement as the real product.</p></div>

<p>A car has two displays. The dashboard shows speed and fuel right now, and glances are enough. The trip log printed at the end of the month shows the whole journey, and you read it at a desk. FortiAnalyzer offers both: live-looking <b>dashboards</b> for watching, and <b>reports</b> for documents. Mixing them up is the commonest confusion.</p>

<h3>Dashboards and FortiView (real product, not simulated)</h3>
<p>In the real product, the GUI offers <b>FortiView</b> and dashboard widgets: tiles and charts for top sources, top applications, top threats and similar views, with a time range you can change and a drill-down from a tile to the logs behind it. The point is quick, interactive looking. You do not file a dashboard; you open it and look. In the simulator, the nearest thing is running a layout by hand and reading its top lists.</p>

<h3>Scheduled and PDF reports (real product, not simulated)</h3>
<p>In the real product a report can be set to run on a <b>schedule</b>, for example every Monday at 06:00 for the previous week. The result can be produced as a file, such as PDF, HTML or CSV, kept on the FortiAnalyzer and sent by <b>email</b> to named readers. This turns a report from something you run into something that arrives. The simulator has no schedule, no file output and no mail. A run happens when you type the command, and the output is text on the screen.</p>

<h3>Custom datasets, charts and layouts (real product, not simulated)</h3>
<p>Behind every predefined report sit three building blocks. A <b>dataset</b> is a query over the log database that selects fields and counts them. A <b>chart</b> takes a dataset and draws it as a table, bar or pie. A <b>report layout</b> arranges charts and text into pages. In the real product you can copy a predefined template and edit it, or build your own from datasets and charts, and you can add a cover page, filters and a time period. The simulator has none of this; its three layouts are fixed.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Simulated versus theory">
<rect x="20" y="20" width="270" height="190" rx="10" fill="#bbf7d0"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="14">Simulated on FAZ-1</text>
<text x="40" y="76" class="svg-ink" font-size="12">Traffic Report</text><text x="40" y="100" class="svg-ink" font-size="12">Threat Report</text><text x="40" y="124" class="svg-ink" font-size="12">Bandwidth and Applications</text>
<text x="40" y="156" class="svg-muted" font-size="12">run by hand, for one ADOM</text><text x="40" y="176" class="svg-muted" font-size="12">or one device, text output</text>
<rect x="350" y="20" width="270" height="190" rx="10" fill="#e2e8f0"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="14">Theory only</text>
<text x="370" y="76" class="svg-ink" font-size="12">Dashboards and FortiView</text><text x="370" y="100" class="svg-ink" font-size="12">Scheduled and PDF reports</text><text x="370" y="124" class="svg-ink" font-size="12">Email delivery</text><text x="370" y="148" class="svg-ink" font-size="12">Custom datasets and charts</text><text x="370" y="172" class="svg-ink" font-size="12">Custom report layouts</text>
</svg><p class="cap">Know the words on the right; practise the commands on the left.</p></div>

<table class="cmp"><tr><th>Topic</th><th>Real product</th><th>Simulator</th></tr>
<tr><td>Live views</td><td>FortiView and dashboard widgets in the GUI</td><td>Not modelled</td></tr>
<tr><td>When a report runs</td><td>On demand or on a schedule</td><td>Only when you type the command</td></tr>
<tr><td>Output</td><td>PDF, HTML, CSV, email</td><td>Text on the console</td></tr>
<tr><td>Design</td><td>Datasets, charts, own layouts</td><td>Three fixed layouts</td></tr>
<tr><td>Where you work</td><td>GUI (Reports section)</td><td><code>execute fazui report ...</code> stand-in</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Kaveri's owner wants "the Madurai bandwidth page in my inbox every Monday". In the real product you would copy a predefined bandwidth template, choose the device, set a weekly schedule and add the owner's address. In the simulator you can only prove that the numbers behind the page exist: run Bandwidth and Applications for MDU-FGT and read it.</p></div>

<h3>What still applies to the real product</h3>
<p>Even a scheduled report with a custom chart reads the same stored analytics logs. So registration, the ADOM, logging settings, retention and quota decide its content. A weekly PDF with empty pages is almost never a report-design problem; it is a log problem. The checks of chapter 4 still come first.</p>
<pre class="code"><span class="c">! what you can really run here: the proof that the data exists</span>
FAZ-1 # execute fazui report run Retail MDU-FGT "Bandwidth and Applications"
FAZ-1 # execute fazui storage Retail</pre>

<div class="warn"><p><b>Common mistakes.</b> Telling a colleague that the simulator can email a report. Saying a dashboard and a report are the same. Spending hours tuning chart design before checking that logs arrive. Believing that a schedule can recover logs that were never stored.</p></div>

<div class="exam"><p><b>Exam traps.</b> A schedule changes when a report runs, not what it can contain. Datasets feed charts, charts feed layouts. Dashboards are for watching, reports are for documents. Anything on the right side of the diagram is theory in this course.</p></div>

<div class="scn"><h4>The weekly PDF full of zeros</h4><p>A new engineer built a neat weekly report with a cover page and three charts, scheduled it, and on Monday the owner received a very smart PDF with all zeros. Nothing was wrong with the design. The branch FortiGate had been connected but never registered, so its logs were discarded since the first day.</p><p><b>Lesson:</b> prove the data first with a manual run, then decorate the output.</p></div>

<div class="iv"><p class="q">"What is the difference between a dashboard and a report?"</p><p>A dashboard is an interactive, near real-time view for watching and drilling down. A report is a defined document over a period, which can be scheduled, produced as a file and emailed. Both read the same stored logs. Add honestly which of these you have operated and which you know from documentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dashboards, FortiView, schedules, PDF and email, datasets and charts are theory here.</li>
<li>The simulator has three fixed layouts, run by hand with text output.</li>
<li>Dataset feeds chart, chart sits in a layout.</li>
<li>Whatever the output format, the content comes from stored analytics logs.</li>
<li>Check the logs before you blame the design.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Pehle ye padho.</b> Is chapter ki lagbhag har cheez <b>theory</b> hai. Simulator dashboards, FortiView, scheduled reports, PDF files, email delivery, custom datasets ya custom charts model nahi karta. Uske paas teen fixed layouts hain jo aap haath se chalate ho. Hum real product ko sankshep mein batate hain taaki aap words jaano aur interview mein baat kar sako, aur har aise statement ko real product ke roop mein mark karte hain.</p></div>

<p>Gaadi mein do displays hote hain. Dashboard abhi ki speed aur fuel dikhata hai, bas ek nazar kaafi hai. Mahine ke end mein chhapa trip log poora safar dikhata hai, aur use aap desk par padhte ho. FortiAnalyzer dono deta hai: dekhne ke liye live-jaise <b>dashboards</b>, aur documents ke liye <b>reports</b>. Inhe mila dena sabse common confusion hai.</p>

<h3>Dashboards aur FortiView (real product, simulated nahi)</h3>
<p>Real product mein GUI <b>FortiView</b> aur dashboard widgets deta hai: top sources, top applications, top threats jaise views ke tiles aur charts, jinka time range badla ja sakta hai aur tile se peeche ke logs tak drill-down hota hai. Maqsad hai tez, interactive dekhna. Dashboard file nahi karte; kholte ho aur dekhte ho. Simulator mein sabse nazdeeki cheez hai layout haath se chalana aur uski top lists padhna.</p>

<h3>Scheduled aur PDF reports (real product, simulated nahi)</h3>
<p>Real product mein report <b>schedule</b> par chalayi ja sakti hai, jaise har Monday 06:00 baje pichhle hafte ke liye. Result file ke roop mein bana sakte hain, jaise PDF, HTML ya CSV, FortiAnalyzer par rakh sakte hain aur named readers ko <b>email</b> se bhej sakte hain. Isse report "jo aap chalate ho" se "jo aapke paas aati hai" ban jati hai. Simulator mein na schedule hai, na file output, na mail. Run tab hota hai jab aap command type karte ho, aur output screen par text hota hai.</p>

<h3>Custom datasets, charts aur layouts (real product, simulated nahi)</h3>
<p>Har predefined report ke peeche teen building blocks hote hain. <b>Dataset</b> log database par ek query hai jo fields chunti aur ginti hai. <b>Chart</b> dataset leta hai aur use table, bar ya pie ki tarah banata hai. <b>Report layout</b> charts aur text ko pages mein sajata hai. Real product mein aap predefined template copy karke edit kar sakte ho, ya datasets aur charts se apna bana sakte ho, aur cover page, filters aur time period jod sakte ho. Simulator mein inmein se kuch nahi; uske teen layouts fixed hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Simulated versus theory">
<rect x="20" y="20" width="270" height="190" rx="10" fill="#bbf7d0"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="14">FAZ-1 par simulated</text>
<text x="40" y="76" class="svg-ink" font-size="12">Traffic Report</text><text x="40" y="100" class="svg-ink" font-size="12">Threat Report</text><text x="40" y="124" class="svg-ink" font-size="12">Bandwidth and Applications</text>
<text x="40" y="156" class="svg-muted" font-size="12">haath se run, ek ADOM ya</text><text x="40" y="176" class="svg-muted" font-size="12">ek device ke liye, text output</text>
<rect x="350" y="20" width="270" height="190" rx="10" fill="#e2e8f0"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="14">Sirf theory</text>
<text x="370" y="76" class="svg-ink" font-size="12">Dashboards aur FortiView</text><text x="370" y="100" class="svg-ink" font-size="12">Scheduled aur PDF reports</text><text x="370" y="124" class="svg-ink" font-size="12">Email delivery</text><text x="370" y="148" class="svg-ink" font-size="12">Custom datasets aur charts</text><text x="370" y="172" class="svg-ink" font-size="12">Custom report layouts</text>
</svg><p class="cap">Right side ke words jaano; left side ke commands practise karo.</p></div>

<table class="cmp"><tr><th>Topic</th><th>Real product</th><th>Simulator</th></tr>
<tr><td>Live views</td><td>GUI mein FortiView aur dashboard widgets</td><td>Model nahi</td></tr>
<tr><td>Report kab chalti hai</td><td>On demand ya schedule par</td><td>Sirf jab aap command type karo</td></tr>
<tr><td>Output</td><td>PDF, HTML, CSV, email</td><td>Console par text</td></tr>
<tr><td>Design</td><td>Datasets, charts, apne layouts</td><td>Teen fixed layouts</td></tr>
<tr><td>Kahan kaam karte hain</td><td>GUI (Reports section)</td><td><code>execute fazui report ...</code> stand-in</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Kaveri ka owner chahta hai "Madurai ka bandwidth page har Monday meri inbox mein". Real product mein aap predefined bandwidth template copy karoge, device chunoge, weekly schedule set karoge aur owner ka address jodoge. Simulator mein aap sirf ye prove kar sakte ho ki page ke peeche ke numbers maujood hain: MDU-FGT ke liye Bandwidth and Applications chalao aur padho.</p></div>

<h3>Real product par bhi kya lagu hota hai</h3>
<p>Custom chart wali scheduled report bhi wahi stored analytics logs padhti hai. Isliye registration, ADOM, logging settings, retention aur quota uska content tay karte hain. Khaali pages wala weekly PDF lagbhag kabhi report-design problem nahi hota; wo log problem hota hai. Chapter 4 ke checks ab bhi pehle aate hain.</p>
<pre class="code"><span class="c">! yahan jo sach mein chala sakte ho: data maujood hone ka saboot</span>
FAZ-1 # execute fazui report run Retail MDU-FGT "Bandwidth and Applications"
FAZ-1 # execute fazui storage Retail</pre>

<div class="warn"><p><b>Common mistakes.</b> Colleague ko batana ki simulator report email kar sakta hai. Dashboard aur report ko ek kehna. Logs aate hain ya nahi check kiye bina chart design tune karne mein ghante lagana. Ye maanna ki schedule wo logs wapas la sakta hai jo store hi nahi hue.</p></div>

<div class="exam"><p><b>Exam traps.</b> Schedule badalta hai ki report kab chalti hai, ye nahi ki usme kya aa sakta hai. Datasets charts ko feed karte hain, charts layouts ko. Dashboards dekhne ke liye, reports documents ke liye. Diagram ki right side ki har cheez is course mein theory hai.</p></div>

<div class="scn"><h4>Zeros se bhara weekly PDF</h4><p>Ek naye engineer ne cover page aur teen charts wali sundar weekly report banayi, schedule ki, aur Monday ko owner ko bahut smart PDF mila jisme sab zero tha. Design mein kuch galat nahi tha. Branch FortiGate connected tha par kabhi register nahi hua tha, isliye uske logs pehle din se discard ho rahe the.</p><p><b>Lesson:</b> pehle manual run se data prove karo, phir output sajao.</p></div>

<div class="iv"><p class="q">"Dashboard aur report mein kya fark hai?"</p><p>Dashboard dekhne aur drill-down karne ke liye interactive, near real-time view hai. Report ek period par defined document hai jo schedule ho sakta hai, file ban sakta hai aur email ho sakta hai. Dono wahi stored logs padhte hain. Imaandari se jodo ki inmein se kaunsa aapne operate kiya aur kaunsa documentation se jaante ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dashboards, FortiView, schedules, PDF aur email, datasets aur charts yahan theory hain.</li>
<li>Simulator mein teen fixed layouts hain, haath se run, text output.</li>
<li>Dataset chart ko feed karta hai, chart layout mein baithta hai.</li>
<li>Output format kuch bhi ho, content stored analytics logs se aata hai.</li>
<li>Design ko doshi thehrane se pehle logs check karo.</li>
</ul></div>
`}};export{e as default};