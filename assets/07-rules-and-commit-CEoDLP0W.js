var e={id:`rules-and-commit`,h:{en:`Security rules, rule order and fw.commit(sync=True)`,hi:`Security rules, rule order aur fw.commit(sync=True)`},body:{en:`
<p>Objects only matter once a rule uses them. A <b>security rule</b> says: traffic from these zones, to these zones, for these addresses and applications, gets this action. In pan-os-python the rule is a <code>SecurityRule</code> that lives under a <code>Rulebase</code>, and the rules are evaluated from the top down.</p>

<div class="dia"><svg viewBox="0 0 640 172" role="img" aria-label="diagram">
<rect x="8" y="14" width="200" height="40" rx="10" fill="#bbf7d0"/><text x="108" y="39" text-anchor="middle" class="svg-ink" font-size="12">1  r-deny  (deny, app any)</text>
<rect x="8" y="64" width="200" height="40" rx="10" fill="#bae6fd"/><text x="108" y="89" text-anchor="middle" class="svg-ink" font-size="12">2  r-web  (allow, web-browsing)</text>
<rect x="8" y="114" width="200" height="40" rx="10" fill="#e2e8f0"/><text x="108" y="139" text-anchor="middle" class="svg-ink" font-size="12">3  rules below ...</text>
<text x="240" y="38" text-anchor="start" class="svg-accent" font-size="13">&lt;- checked first</text>
<text x="240" y="88" text-anchor="start" class="svg-muted" font-size="12">&lt;- reached only if rule 1 did not match</text>
<text x="240" y="138" text-anchor="start" class="svg-muted" font-size="12">first match wins; order is part of the change</text>
</svg><p class="cap">Rules are read top to bottom. SecurityRule.move() changes the order.</p></div>

<h3>Creating a rule and fixing its position</h3>
<p>The rule keeps lists of zones, addresses and applications, written as Python lists. Applications are named (<code>web-browsing</code>), not port numbers. A new rule goes to the bottom; <code>move()</code> changes that.</p>
<pre class="code">rulebase = fw.add(policies.Rulebase())
rulebase.add(policies.SecurityRule("r-web", fromzone=["trust"], tozone=["dmz"], destination=["app2"],
                                   application=["web-browsing"], action="allow")).create()
last = rulebase.add(policies.SecurityRule("r-deny", fromzone=["trust"], tozone=["dmz"], destination=["app2"],
                                          application=["any"], action="deny"))
last.create()
last.move("top")
print("order:", [r.name for r in policies.SecurityRule.refreshall(rulebase, add=False)])</pre>
<p>The new <code>r-deny</code> was created last and moved to the top. Order is part of the change: a deny above an allow with the same match makes the allow unreachable. Always read the order back after a change.</p>

<h3>fw.commit(sync=True)</h3>
<p>Writing the rule changed only the candidate. In chapter 5 you wrote the commit loop by hand; the library has it built in. With <code>sync=True</code> it starts the commit, polls the job and returns a <b>dictionary</b> with the outcome. If there is nothing to commit it returns <code>None</code>, as the lab showed earlier: <code>second commit: None</code>.</p>
<p>The dictionary has <code>success</code>, <code>result</code> (OK or FAIL), and <code>messages</code>, the details lines. By default a failed commit is returned as data, not raised. To get an exception, pass <code>exception=True</code>: you receive <code>PanCommitFailed</code>.</p>
<pre class="code">result = fw.commit(sync=True)
print("success:", result["success"], "| result:", result["result"])
for line in result["messages"]:
    print("   ", line.strip())
try:
    fw.commit(sync=True, exception=True)
except panos.PanCommitFailed as err:
    print("PanCommitFailed raised")</pre>
<pre class="out">AUTO01$ python3 rulesdemo.py
order: ['r-deny', 'r-web']
commit: OK
success: False | result: FAIL
    Validation Error:
    rulebase -&gt; security -&gt; rules -&gt; r-bad service is missing
    Commit failed
<span class="hl">PanCommitFailed raised</span>
after the fix: OK</pre>
<p>The first commit was OK. Then a rule without a service was added directly through the XML API (the same fault as in chapter 5). The second commit is returned with <code>success: False</code> and the validation messages. Calling it again with <code>exception=True</code> raised <code>PanCommitFailed</code>. Choose the style you can test: a dictionary is easy in a loop that reports every failure, an exception stops a pipeline cleanly.</p>

<h3>Verify with the firewall's own policy test</h3>
<p>Reading the rule back shows what you wrote. It does not show what the firewall <b>decides</b>. For that, run the operational command <code>test security-policy-match</code>, which the library sends with <code>fw.op(cmd_xml=False)</code> (you pass the XML yourself):</p>
<pre class="code">TEST = ("&lt;test&gt;&lt;security-policy-match&gt;&lt;from&gt;trust&lt;/from&gt;&lt;to&gt;dmz&lt;/to&gt;&lt;source&gt;10.99.0.60&lt;/source&gt;"
        "&lt;destination&gt;10.20.0.10&lt;/destination&gt;&lt;protocol&gt;6&lt;/protocol&gt;&lt;destination-port&gt;%d&lt;/destination-port&gt;"
        "&lt;/security-policy-match&gt;&lt;/test&gt;")
for port in (80, 22):
    reply = fw.op(TEST % port, cmd_xml=False)
    rule = reply.find("./result/rules/entry")
    print("tcp/%d from trust to dmz: %s" % (port, rule.get("name") if rule is not None else "no rule matches"))</pre>
<pre class="out">AUTO01$ python3 verify.py
rule allow-web: ['trust'] -&gt; ['dmz'] dst=['web-pool'] app=['web-browsing'] svc=['application-default'] action=allow
<span class="hl">tcp/80 from trust to dmz: allow-web</span>
<span class="hl">tcp/22 from trust to dmz: no rule matches</span></pre>
<p>Web traffic (tcp/80) from the automation host to the web server hits <code>allow-web</code>; ssh (tcp/22) matches no rule, and the firewall would use its default policy. This is a real acceptance test: it asks the running policy engine, not the text in the file.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting that new rules go to the bottom, below a broader deny. Using port numbers where an application name is expected. Ignoring the return value of <code>commit</code>. Calling <code>fw.commit()</code> without <code>sync=True</code> and moving on while the job still runs. Testing only the candidate and not the running policy.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>commit(sync=True)</code> returns <code>None</code> when nothing changed, a dictionary with <code>success False</code> when the job failed, and raises only when you ask with <code>exception=True</code>. A script that does <code>result["result"]</code> without checking <code>None</code> breaks on the very commit that had nothing to do.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The simulator supports <code>test security-policy-match</code> with the arguments shown. A real firewall also considers users, URL categories and security profiles in the match, and larger commits take longer than the lab's.</p></div>

<div class="scn"><h4>The allow that never matched</h4><p>An engineer added <code>allow-web</code> through the API and the commit was OK, but users still could not reach the site. The rulebase already had a deny for the same zones at position 1, and the new rule sat at position 12. A policy test for tcp/80 showed the deny rule matching, which saved an hour of looking at routing.</p><p><b>Lesson:</b> a successful commit proves the file is valid, not that the traffic is allowed. Test the match.</p></div>

<div class="iv"><p class="q">"How do you check in a script that a new firewall rule really works?"</p><p>After the commit I read the rule back to confirm its fields and its position, then I run <code>test security-policy-match</code> for the exact source, destination and port and assert that the expected rule name is returned. If it names a different rule, the order is wrong.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A <code>SecurityRule</code> lives under a <code>Rulebase</code>; rules match from the top, first match wins.</li>
<li>New rules go to the bottom; use <code>move()</code> and read the order back.</li>
<li><code>fw.commit(sync=True)</code> returns a dictionary, or <code>None</code> if nothing changed.</li>
<li>A failed commit is data by default; <code>exception=True</code> raises <code>PanCommitFailed</code>.</li>
<li>Check behaviour with <code>test security-policy-match</code>, not only by reading the rule.</li>
</ul></div>
`,hi:`
<p>Objects tabhi kaam ke hain jab koi rule unhe use kare. <b>Security rule</b> kehta hai: in zones se, in zones tak, in addresses aur applications ke traffic ko yeh action milega. pan-os-python mein rule ek <code>SecurityRule</code> hai jo <code>Rulebase</code> ke neeche rehta hai, aur rules upar se neeche evaluate hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 172" role="img" aria-label="diagram">
<rect x="8" y="14" width="200" height="40" rx="10" fill="#bbf7d0"/><text x="108" y="39" text-anchor="middle" class="svg-ink" font-size="12">1  r-deny  (deny, app any)</text>
<rect x="8" y="64" width="200" height="40" rx="10" fill="#bae6fd"/><text x="108" y="89" text-anchor="middle" class="svg-ink" font-size="12">2  r-web  (allow, web-browsing)</text>
<rect x="8" y="114" width="200" height="40" rx="10" fill="#e2e8f0"/><text x="108" y="139" text-anchor="middle" class="svg-ink" font-size="12">3  neeche ke rules ...</text>
<text x="240" y="38" text-anchor="start" class="svg-accent" font-size="13">&lt;- pehle check hota hai</text>
<text x="240" y="88" text-anchor="start" class="svg-muted" font-size="12">&lt;- tabhi aata hai jab rule 1 match na kare</text>
<text x="240" y="138" text-anchor="start" class="svg-muted" font-size="12">pehla match jeetta hai; order bhi change ka hissa hai</text>
</svg><p class="cap">Rules upar se neeche padhe jaate hain. SecurityRule.move() order badalta hai.</p></div>

<h3>Rule banana aur uski position tay karna</h3>
<p>Rule zones, addresses aur applications ki lists rakhta hai, Python lists ki tarah. Applications naam se likhe jaate hain (<code>web-browsing</code>), port number se nahi. Naya rule neeche jaata hai; <code>move()</code> use badalta hai.</p>
<pre class="code">rulebase = fw.add(policies.Rulebase())
rulebase.add(policies.SecurityRule("r-web", fromzone=["trust"], tozone=["dmz"], destination=["app2"],
                                   application=["web-browsing"], action="allow")).create()
last = rulebase.add(policies.SecurityRule("r-deny", fromzone=["trust"], tozone=["dmz"], destination=["app2"],
                                          application=["any"], action="deny"))
last.create()
last.move("top")
print("order:", [r.name for r in policies.SecurityRule.refreshall(rulebase, add=False)])</pre>
<p>Naya <code>r-deny</code> aakhir mein bana aur top par move hua. Order change ka hissa hai: same match wale allow ke upar deny ho to allow kabhi pahunchta hi nahi. Change ke baad order hamesha wapas padho.</p>

<h3>fw.commit(sync=True)</h3>
<p>Rule likhne se sirf candidate badla. Chapter 5 mein aapne commit loop haath se likha; library mein woh built-in hai. <code>sync=True</code> ke saath woh commit shuru karti hai, job poll karti hai aur natije ke saath ek <b>dictionary</b> lautati hai. Commit karne ko kuch na ho to <code>None</code> lautati hai, jaisa lab ne pehle dikhaya: <code>second commit: None</code>.</p>
<p>Dictionary mein <code>success</code>, <code>result</code> (OK ya FAIL) aur <code>messages</code>, yaani details lines, hoti hain. Default mein failed commit data ki tarah lautaya jaata hai, raise nahi hota. Exception chahiye to <code>exception=True</code> do: aapko <code>PanCommitFailed</code> milta hai.</p>
<pre class="code">result = fw.commit(sync=True)
print("success:", result["success"], "| result:", result["result"])
for line in result["messages"]:
    print("   ", line.strip())
try:
    fw.commit(sync=True, exception=True)
except panos.PanCommitFailed as err:
    print("PanCommitFailed raised")</pre>
<pre class="out">AUTO01$ python3 rulesdemo.py
order: ['r-deny', 'r-web']
commit: OK
success: False | result: FAIL
    Validation Error:
    rulebase -&gt; security -&gt; rules -&gt; r-bad service is missing
    Commit failed
<span class="hl">PanCommitFailed raised</span>
after the fix: OK</pre>
<p>Pehla commit OK tha. Phir XML API se seedha ek bina service wala rule joda gaya (chapter 5 wali wahi galti). Doosra commit <code>success: False</code> aur validation messages ke saath lauta. <code>exception=True</code> ke saath dobara bulane par <code>PanCommitFailed</code> raise hua. Wohi style chuno jise test kar sako: dictionary har failure report karne wale loop mein aasaan hai, exception pipeline ko saaf tareeke se rok deta hai.</p>

<h3>Firewall ke apne policy test se verify karo</h3>
<p>Rule wapas padhne se dikhta hai aapne kya likha. Yeh nahi dikhta ki firewall kya <b>tay karta hai</b>. Uske liye operational command <code>test security-policy-match</code> chalao, jo library <code>fw.op(cmd_xml=False)</code> se bhejti hai (XML aap khud dete ho):</p>
<pre class="code">TEST = ("&lt;test&gt;&lt;security-policy-match&gt;&lt;from&gt;trust&lt;/from&gt;&lt;to&gt;dmz&lt;/to&gt;&lt;source&gt;10.99.0.60&lt;/source&gt;"
        "&lt;destination&gt;10.20.0.10&lt;/destination&gt;&lt;protocol&gt;6&lt;/protocol&gt;&lt;destination-port&gt;%d&lt;/destination-port&gt;"
        "&lt;/security-policy-match&gt;&lt;/test&gt;")
for port in (80, 22):
    reply = fw.op(TEST % port, cmd_xml=False)
    rule = reply.find("./result/rules/entry")
    print("tcp/%d from trust to dmz: %s" % (port, rule.get("name") if rule is not None else "no rule matches"))</pre>
<pre class="out">AUTO01$ python3 verify.py
rule allow-web: ['trust'] -&gt; ['dmz'] dst=['web-pool'] app=['web-browsing'] svc=['application-default'] action=allow
<span class="hl">tcp/80 from trust to dmz: allow-web</span>
<span class="hl">tcp/22 from trust to dmz: no rule matches</span></pre>
<p>Automation host se web server tak ka web traffic (tcp/80) <code>allow-web</code> se milta hai; ssh (tcp/22) kisi rule se nahi milta, aur firewall apni default policy use karega. Yeh asli acceptance test hai: yeh chalti hui policy engine se poochta hai, file ke text se nahi.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Yeh bhoolna ki naye rules neeche jaate hain, kisi bade deny ke baad. Jahan application ka naam chahiye wahan port number likhna. <code>commit</code> ki return value ignore karna. <code>sync=True</code> ke bina <code>fw.commit()</code> bulana aur job chalti rehte hue aage badh jaana. Sirf candidate test karna, running policy nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>commit(sync=True)</code> kuch na badla ho to <code>None</code> lautata hai, job fail ho to <code>success False</code> wali dictionary, aur raise tabhi karta hai jab aap <code>exception=True</code> maangte ho. <code>None</code> check kiye bina <code>result["result"]</code> karne wali script usi commit par tootti hai jisme karne ko kuch tha hi nahi.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Simulator dikhaye gaye arguments ke saath <code>test security-policy-match</code> support karta hai. Asli firewall match mein users, URL categories aur security profiles bhi dekhta hai, aur bade commits lab se zyada time lete hain.</p></div>

<div class="scn"><h4>Allow jo kabhi match nahi hua</h4><p>Ek engineer ne API se <code>allow-web</code> joda aur commit OK tha, phir bhi users site tak nahi pahunch paaye. Rulebase mein position 1 par same zones ka deny pehle se tha, aur naya rule position 12 par tha. tcp/80 ke policy test ne deny rule ko match dikhaya, jisse routing dekhne ka ek ghanta bach gaya.</p><p><b>Lesson:</b> successful commit saabit karta hai ki file valid hai, yeh nahi ki traffic allowed hai. Match test karo.</p></div>

<div class="iv"><p class="q">"Script mein kaise check karoge ki naya firewall rule sach mein kaam karta hai?"</p><p>Commit ke baad rule wapas padhta hoon taaki fields aur position confirm ho, phir exact source, destination aur port ke liye <code>test security-policy-match</code> chalata hoon aur assert karta hoon ki expected rule ka naam lauta. Agar doosre rule ka naam aaye to order galat hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>SecurityRule</code> <code>Rulebase</code> ke neeche rehta hai; rules upar se match hote hain, pehla match jeetta hai.</li>
<li>Naye rules neeche jaate hain; <code>move()</code> use karo aur order wapas padho.</li>
<li><code>fw.commit(sync=True)</code> dictionary lautata hai, ya kuch na badla ho to <code>None</code>.</li>
<li>Failed commit default mein data hai; <code>exception=True</code> se <code>PanCommitFailed</code> raise hota hai.</li>
<li>Behaviour <code>test security-policy-match</code> se check karo, sirf rule padh kar nahi.</li>
</ul></div>
`}};export{e as default};