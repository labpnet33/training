var e={id:`the-gate`,h:{en:`The gate: five stages, one exit code`,hi:`Gate: paanch stages, ek exit code`},body:{en:`
<p>A pilot runs a checklist in a fixed order, and a failed item stops the take-off. The gate is the same idea for a change. It is one script that runs the checks from the earlier chapters in order of cost, stops at the first failure, says why, writes a report and returns an exit code that a pipeline can act on. This chapter is the second half of Lab 1 (tasks 3 to 7).</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="The five stages of gate.py"><rect x="6" y="26" width="114" height="46" rx="9" fill="#bae6fd"/><text x="63" y="53" text-anchor="middle" class="svg-ink" font-size="12">1 intent shape</text><rect x="132" y="26" width="114" height="46" rx="9" fill="#ddd6fe"/><text x="189" y="53" text-anchor="middle" class="svg-ink" font-size="12">2 config hygiene</text><rect x="258" y="26" width="114" height="46" rx="9" fill="#ddd6fe"/><text x="315" y="53" text-anchor="middle" class="svg-ink" font-size="12">3 bgp sessions</text><rect x="384" y="26" width="114" height="46" rx="9" fill="#fde68a"/><text x="441" y="53" text-anchor="middle" class="svg-ink" font-size="12">4 state diff</text><rect x="510" y="26" width="114" height="46" rx="9" fill="#fde68a"/><text x="567" y="53" text-anchor="middle" class="svg-ink" font-size="12">5 reachability</text><line x1="120" y1="49" x2="132" y2="49" stroke="#64748b" stroke-width="2"/><polygon points="132,49 123,54 123,44" fill="#64748b"/><line x1="246" y1="49" x2="258" y2="49" stroke="#64748b" stroke-width="2"/><polygon points="258,49 249,54 249,44" fill="#64748b"/><line x1="372" y1="49" x2="384" y2="49" stroke="#64748b" stroke-width="2"/><polygon points="384,49 375,54 375,44" fill="#64748b"/><line x1="498" y1="49" x2="510" y2="49" stroke="#64748b" stroke-width="2"/><polygon points="510,49 501,54 501,44" fill="#64748b"/><text x="63" y="96" text-anchor="middle" class="svg-accent" font-size="11">typo, wrong type</text><text x="189" y="96" text-anchor="middle" class="svg-accent" font-size="11">undefined name</text><text x="315" y="96" text-anchor="middle" class="svg-accent" font-size="11">AS mismatch</text><text x="441" y="96" text-anchor="middle" class="svg-accent" font-size="11">route removed</text><text x="567" y="96" text-anchor="middle" class="svg-accent" font-size="11">NO_ROUTE</text><rect x="190" y="124" width="260" height="42" rx="9" fill="#bbf7d0"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">GATE PASSED   exit code 0</text><text x="320" y="184" text-anchor="middle" class="svg-muted" font-size="12">The first failing stage stops the run and writes the reason into gate-report.json.</text></svg><p class="cap">Cheap checks first, expensive ones last; each stage prints why it failed.</p></div>

<h3>Design in four decisions</h3>
<ol>
<li><b>Cheap first.</b> The schema check needs no Batfish, so it runs first. The session to Batfish opens only when the intent is sane. That keeps the common failure (a typo in the request) fast and independent of any service.</li>
<li><b>Stop at the first failing stage.</b> A later stage may be meaningless after an earlier one failed: a state diff of a snapshot with undefined references mixes real changes with side effects of the typo.</li>
<li><b>Every stage returns a list of reasons.</b> Empty means ok. The same shape for all stages lets one loop run, print and report them.</li>
<li><b>The exit code is the contract.</b> 0 means "may deploy", 1 means "blocked". Everything else, colours and wording, is for people.</li>
</ol>

<h3>The stages</h3>
<p>Stages 1 to 3 reuse what you built. Each is a small function that returns the reasons it found.</p>
<pre class="code">def stage_intent(ctx):
    return ["%s: %s" % (where(e), e.message) for e in load_errors(ctx["intent_file"])]


def stage_hygiene(ctx):
    return hygiene(ctx["bf"], ctx["candidate"])


def stage_sessions(ctx):
    status = sessions(ctx["bf"], ctx["candidate"])
    bad = []
    for s in ctx["intent"]["sessions"]:
        for node, peer_ip in ((s["a"], s["b_ip"]), (s["b"], s["a_ip"])):
            got = status.get("%s %s" % (node, peer_ip), "MISSING")
            if got != "ESTABLISHED":
                bad.append("%s to %s is %s" % (node, peer_ip, got))
    return bad</pre>
<p>Stage 3 turns the intent into expectations: for every session in the YAML, both ends must be <code>ESTABLISHED</code> in the candidate. Notice that the intent drives the check. The request says what should exist and Batfish confirms it. Stage 4 is the expected-difference rule from chapter 4. Stage 5 closes the loop:</p>
<pre class="code">def stage_reach(ctx):
    bad = []
    for a in ctx["intent"]["announce"]:
        target = str(ipaddress.ip_network(a["prefix"])[1])
        for node in NODES:
            if node == a["node"]:
                continue
            frame = ctx["bf"].q.traceroute(startLocation=node, headers=HeaderConstraints(dstIps=target)).answer(snapshot=ctx["candidate"]).frame()
            disposition = frame.iloc[0]["Traces"][0].disposition
            print("    %s to %s: %s" % (node, target, disposition))
            if disposition != "ACCEPTED":
                bad.append("%s cannot reach %s (%s)" % (node, target, disposition))
    return bad</pre>
<p>For each announced prefix it takes the first host address (<code>ip_network(...)[1]</code>, which is 192.0.2.1) and traces to it from every other router. The runner joins everything:</p>
<pre class="code">STAGES = [("intent shape", stage_intent), ("config hygiene", stage_hygiene), ("bgp sessions", stage_sessions),
          ("state diff", stage_state), ("reachability", stage_reach)]


def main(intent_file, live, candidate):
    ctx = {"intent_file": intent_file, "live": live, "candidate": candidate}
    report = {"stages": []}
    for number, (name, stage) in enumerate(STAGES, 1):
        if number == 2:                       # the intent is sane: now it is worth talking to Batfish
            ctx["intent"] = yaml.safe_load(open(intent_file))
            ctx["bf"] = open_session()
            load(ctx["bf"], live)
            load(ctx["bf"], candidate)
        reasons = stage(ctx)
        print("[%d/%d] %-15s %s" % (number, len(STAGES), name, "ok" if not reasons else "FAILED"))
        for why in reasons:
            print("      - " + why)
        report["stages"].append({"stage": name, "ok": not reasons, "reasons": reasons})
        if reasons:
            report["result"] = "BLOCKED"
            break
    else:
        report["result"] = "PASSED"
    with open("gate-report.json", "w") as f:
        json.dump(report, f, indent=2)
    print("GATE %s" % report["result"])
    return 0 if report["result"] == "PASSED" else 1</pre>

<h3>Run it and read it</h3>
<p>Run 1 uses the original request. It stops at stage 1 and never starts Batfish:</p>
<pre class="out"><span class="hl">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"</span>
<span class="hl">[1/5] intent shape    FAILED</span>
      - announce/0: 'policy' is a required property
      - announce/0: Additional properties are not allowed ('polcy' was unexpected)
      - sessions/1/b_asn: '65003' is not of type 'integer'
      - sessions/1/b_ip: '10.0.13.300' is not a 'ipv4'
<span class="hl">GATE BLOCKED</span>
<span class="hl">exit code: 1</span></pre>
<p>After fixing the three typos in the YAML, run 2 reaches Batfish. Stage 2 finds the extra T in the route-map name used on the neighbour towards e1:</p>
<pre class="out">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"
[1/5] intent shape    ok
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
<span class="hl">[2/5] config hygiene  FAILED</span>
<span class="hl">      - undefined route-map RM-CUST-OUTT (bgp outbound route-map) configs/xe1.cfg:[30]</span>
<span class="hl">GATE BLOCKED</span>
exit code: 1</pre>
<p>Fix the typo with <code>sed</code>. Run 3 passes stages 1 to 3 and the state diff catches what no test asked about: the route-map ends in an implicit deny, so xe1 stops announcing its loopback and the transit routes.</p>
<pre class="out">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"
[1/5] intent shape    ok
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/5] config hygiene  ok
[3/5] bgp sessions    ok
<span class="hl">[4/5] state diff      FAILED</span>
<span class="hl">      - removed root['e1']['1.1.1.1/32']</span>
<span class="hl">      - removed root['e1']['2.2.2.2/32']</span>
<span class="hl">      - removed root['j1']['1.1.1.1/32']</span>
<span class="hl">      - removed root['j1']['3.3.3.3/32']</span>
<span class="hl">GATE BLOCKED</span>
exit code: 1</pre>
<p>The fix is a final clause without a match, <code>route-map RM-CUST-OUT permit 20</code>, which permits everything else. Run 4:</p>
<pre class="out"><span class="hl">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"</span>
[1/5] intent shape    ok
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/5] config hygiene  ok
[3/5] bgp sessions    ok
[4/5] state diff      ok
<span class="hl">    j1 to 192.0.2.1: ACCEPTED</span>
<span class="hl">    e1 to 192.0.2.1: ACCEPTED</span>
[5/5] reachability    ok
<span class="hl">GATE PASSED</span>
<span class="hl">exit code: 0</span></pre>
<p>The report file keeps the same facts for the ticket and the pipeline log:</p>
<pre class="out">AUTO01$ cat gate-report.json
{
  "stages": [
    {
      "stage": "intent shape",
      "ok": true,
      "reasons": []
    },
...
  ],
<span class="hl">  "result": "PASSED"</span>
}</pre>

<h3>Where the gate sits in the real process</h3>
<p>The gate runs on every pull request and again right before the change window, on the same inputs. A pass allows the push, which you do with the safe methods of the earlier modules: <b>adv-pyez-config</b> (lock, diff, commit confirmed) or <b>adv-netconf</b> (candidate, validate, confirmed commit). After the push, <b>adv-junos-validate</b> proves the live state matches what the model predicted. The gate is the first of three nets, not the only one.</p>

<div class="warn"><p><b>What a green gate does not prove.</b> It checks the configs you gave it. If live drifted from the files, the model describes a network that does not exist. It cannot see cables, optics, MTU on the wire, hardware limits or a vendor bug. A schema cannot know that VLAN 4000 is reserved on your platform. Say "passed the pre-checks", never "safe".</p></div>
<div class="exam"><p><b>Exam trap.</b> A script that prints BLOCKED but ends with exit code 0 is not a gate. Always test the exit code with <code>echo "exit code: $?"</code> as the lab does.</p></div>

<div class="scn"><h4>The gate that was always green</h4><p>A team added a Batfish step to the pipeline but wrote <code>|| true</code> after it "so it never breaks the build". Six months later an audit found fourteen merged changes with undefined references in the logs. Removing <code>|| true</code> broke the build once, on the first day, on a real typo.</p><p><b>Lesson:</b> a check you cannot fail is decoration.</p></div>

<div class="iv"><p class="q">"Design a pre-deployment gate for network changes."</p><p>Stages in order of cost: schema on the request, Batfish hygiene on the candidate configs, session checks against the intent, a diff of modelled state with the intended difference whitelisted, and reachability traces for what the change promises. Fail fast with reasons, write a JSON report, exit 1 when blocked. Then push with a confirmed commit and verify the live state afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A gate is a loop over stages that return reasons, with an exit code as the contract.</li>
<li>Cheap checks first; open Batfish only after the intent is valid.</li>
<li>Let the intent drive the checks: sessions, expected additions, traced prefixes.</li>
<li>Write a report for people; use the exit code for machines.</li>
<li>Green means passed the pre-checks, not safe: keep the commit-confirmed push and the post-check.</li>
</ul></div>
`,hi:`
<p>Pilot ek tay kram mein checklist chalata hai, aur ek item fail ho to take-off ruk jaata hai. Gate change ke liye wahi idea hai. Yeh ek script hai jo pichhle chapters ke checks ko kharche ke kram mein chalati hai, pehle failure par ruk jaati hai, wajah batati hai, report likhti hai aur aisa exit code deti hai jis par pipeline kaam kar sake. Yeh chapter Lab 1 ka doosra aadha hissa hai (tasks 3 se 7).</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="gate.py ke paanch stages"><rect x="6" y="26" width="114" height="46" rx="9" fill="#bae6fd"/><text x="63" y="53" text-anchor="middle" class="svg-ink" font-size="12">1 intent shape</text><rect x="132" y="26" width="114" height="46" rx="9" fill="#ddd6fe"/><text x="189" y="53" text-anchor="middle" class="svg-ink" font-size="12">2 config hygiene</text><rect x="258" y="26" width="114" height="46" rx="9" fill="#ddd6fe"/><text x="315" y="53" text-anchor="middle" class="svg-ink" font-size="12">3 bgp sessions</text><rect x="384" y="26" width="114" height="46" rx="9" fill="#fde68a"/><text x="441" y="53" text-anchor="middle" class="svg-ink" font-size="12">4 state diff</text><rect x="510" y="26" width="114" height="46" rx="9" fill="#fde68a"/><text x="567" y="53" text-anchor="middle" class="svg-ink" font-size="12">5 reachability</text><line x1="120" y1="49" x2="132" y2="49" stroke="#64748b" stroke-width="2"/><polygon points="132,49 123,54 123,44" fill="#64748b"/><line x1="246" y1="49" x2="258" y2="49" stroke="#64748b" stroke-width="2"/><polygon points="258,49 249,54 249,44" fill="#64748b"/><line x1="372" y1="49" x2="384" y2="49" stroke="#64748b" stroke-width="2"/><polygon points="384,49 375,54 375,44" fill="#64748b"/><line x1="498" y1="49" x2="510" y2="49" stroke="#64748b" stroke-width="2"/><polygon points="510,49 501,54 501,44" fill="#64748b"/><text x="63" y="96" text-anchor="middle" class="svg-accent" font-size="11">typo, galat type</text><text x="189" y="96" text-anchor="middle" class="svg-accent" font-size="11">undefined naam</text><text x="315" y="96" text-anchor="middle" class="svg-accent" font-size="11">AS mismatch</text><text x="441" y="96" text-anchor="middle" class="svg-accent" font-size="11">route hata</text><text x="567" y="96" text-anchor="middle" class="svg-accent" font-size="11">NO_ROUTE</text><rect x="190" y="124" width="260" height="42" rx="9" fill="#bbf7d0"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">GATE PASSED   exit code 0</text><text x="320" y="184" text-anchor="middle" class="svg-muted" font-size="12">Pehla fail hone wala stage run rok deta hai aur wajah gate-report.json mein likhta hai.</text></svg><p class="cap">Sasti checks pehle, mehngi baad mein; har stage batata hai ki kyun fail hua.</p></div>

<h3>Chaar faislon mein design</h3>
<ol>
<li><b>Pehle sasta.</b> Schema check ko Batfish nahi chahiye, isliye woh pehle chalta hai. Batfish ka session tabhi khulta hai jab intent theek ho. Isse aam failure (request mein typo) tez rehta hai aur kisi service par depend nahi karta.</li>
<li><b>Pehle fail hone wale stage par ruko.</b> Pehle stage ke fail hone ke baad aage ka stage bematlab ho sakta hai: undefined references wale snapshot ka state diff asli badlaav ko typo ke side effects se mila deta hai.</li>
<li><b>Har stage reasons ki list lautata hai.</b> Khaali ka matlab ok. Sabke liye ek hi shape se ek loop sabko chalata, print karta aur report karta hai.</li>
<li><b>Exit code hi contract hai.</b> 0 ka matlab "deploy kar sakte ho", 1 ka matlab "blocked". Baaki sab, rang aur wording, logon ke liye hai.</li>
</ol>

<h3>Stages</h3>
<p>Stages 1 se 3 wahi use karte hain jo aapne banaya. Har ek chhota function hai jo mili hui reasons lautata hai.</p>
<pre class="code">def stage_intent(ctx):
    return ["%s: %s" % (where(e), e.message) for e in load_errors(ctx["intent_file"])]


def stage_hygiene(ctx):
    return hygiene(ctx["bf"], ctx["candidate"])


def stage_sessions(ctx):
    status = sessions(ctx["bf"], ctx["candidate"])
    bad = []
    for s in ctx["intent"]["sessions"]:
        for node, peer_ip in ((s["a"], s["b_ip"]), (s["b"], s["a_ip"])):
            got = status.get("%s %s" % (node, peer_ip), "MISSING")
            if got != "ESTABLISHED":
                bad.append("%s to %s is %s" % (node, peer_ip, got))
    return bad</pre>
<p>Stage 3 intent ko expectations mein badalta hai: YAML ke har session ke liye, candidate mein dono ends <code>ESTABLISHED</code> hone chahiye. Dhyan do ki intent check ko chalata hai. Request batati hai kya hona chahiye aur Batfish confirm karta hai. Stage 4 chapter 4 ka expected-difference rule hai. Stage 5 chakra poora karta hai:</p>
<pre class="code">def stage_reach(ctx):
    bad = []
    for a in ctx["intent"]["announce"]:
        target = str(ipaddress.ip_network(a["prefix"])[1])
        for node in NODES:
            if node == a["node"]:
                continue
            frame = ctx["bf"].q.traceroute(startLocation=node, headers=HeaderConstraints(dstIps=target)).answer(snapshot=ctx["candidate"]).frame()
            disposition = frame.iloc[0]["Traces"][0].disposition
            print("    %s to %s: %s" % (node, target, disposition))
            if disposition != "ACCEPTED":
                bad.append("%s cannot reach %s (%s)" % (node, target, disposition))
    return bad</pre>
<p>Har announce hue prefix ke liye woh pehla host address leta hai (<code>ip_network(...)[1]</code>, yaani 192.0.2.1) aur har doosre router se us tak trace karta hai. Runner sab jodta hai:</p>
<pre class="code">STAGES = [("intent shape", stage_intent), ("config hygiene", stage_hygiene), ("bgp sessions", stage_sessions),
          ("state diff", stage_state), ("reachability", stage_reach)]


def main(intent_file, live, candidate):
    ctx = {"intent_file": intent_file, "live": live, "candidate": candidate}
    report = {"stages": []}
    for number, (name, stage) in enumerate(STAGES, 1):
        if number == 2:                       # the intent is sane: now it is worth talking to Batfish
            ctx["intent"] = yaml.safe_load(open(intent_file))
            ctx["bf"] = open_session()
            load(ctx["bf"], live)
            load(ctx["bf"], candidate)
        reasons = stage(ctx)
        print("[%d/%d] %-15s %s" % (number, len(STAGES), name, "ok" if not reasons else "FAILED"))
        for why in reasons:
            print("      - " + why)
        report["stages"].append({"stage": name, "ok": not reasons, "reasons": reasons})
        if reasons:
            report["result"] = "BLOCKED"
            break
    else:
        report["result"] = "PASSED"
    with open("gate-report.json", "w") as f:
        json.dump(report, f, indent=2)
    print("GATE %s" % report["result"])
    return 0 if report["result"] == "PASSED" else 1</pre>

<h3>Chalao aur padho</h3>
<p>Run 1 original request use karta hai. Woh stage 1 par ruk jaata hai aur Batfish shuru hi nahi karta:</p>
<pre class="out"><span class="hl">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"</span>
<span class="hl">[1/5] intent shape    FAILED</span>
      - announce/0: 'policy' is a required property
      - announce/0: Additional properties are not allowed ('polcy' was unexpected)
      - sessions/1/b_asn: '65003' is not of type 'integer'
      - sessions/1/b_ip: '10.0.13.300' is not a 'ipv4'
<span class="hl">GATE BLOCKED</span>
<span class="hl">exit code: 1</span></pre>
<p>YAML ke teen typos theek karne ke baad run 2 Batfish tak pahunchta hai. Stage 2 e1 ki taraf wale neighbour par use hue route-map naam ka extra T pakadta hai:</p>
<pre class="out">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"
[1/5] intent shape    ok
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
<span class="hl">[2/5] config hygiene  FAILED</span>
<span class="hl">      - undefined route-map RM-CUST-OUTT (bgp outbound route-map) configs/xe1.cfg:[30]</span>
<span class="hl">GATE BLOCKED</span>
exit code: 1</pre>
<p>Typo <code>sed</code> se theek karo. Run 3 stages 1 se 3 pass karta hai aur state diff woh pakadta hai jo kisi test ne poochha hi nahi: route-map ka ant implicit deny hai, isliye xe1 apna loopback aur transit routes announce karna band kar deta hai.</p>
<pre class="out">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"
[1/5] intent shape    ok
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/5] config hygiene  ok
[3/5] bgp sessions    ok
<span class="hl">[4/5] state diff      FAILED</span>
<span class="hl">      - removed root['e1']['1.1.1.1/32']</span>
<span class="hl">      - removed root['e1']['2.2.2.2/32']</span>
<span class="hl">      - removed root['j1']['1.1.1.1/32']</span>
<span class="hl">      - removed root['j1']['3.3.3.3/32']</span>
<span class="hl">GATE BLOCKED</span>
exit code: 1</pre>
<p>Fix bina match wala aakhri clause hai, <code>route-map RM-CUST-OUT permit 20</code>, jo baaki sab permit karta hai. Run 4:</p>
<pre class="out"><span class="hl">AUTO01$ python3 gate.py intent.yaml live candidate; echo "exit code: $?"</span>
[1/5] intent shape    ok
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
[2/5] config hygiene  ok
[3/5] bgp sessions    ok
[4/5] state diff      ok
<span class="hl">    j1 to 192.0.2.1: ACCEPTED</span>
<span class="hl">    e1 to 192.0.2.1: ACCEPTED</span>
[5/5] reachability    ok
<span class="hl">GATE PASSED</span>
<span class="hl">exit code: 0</span></pre>
<p>Report file wahi facts ticket aur pipeline log ke liye rakhti hai:</p>
<pre class="out">AUTO01$ cat gate-report.json
{
  "stages": [
    {
      "stage": "intent shape",
      "ok": true,
      "reasons": []
    },
...
  ],
<span class="hl">  "result": "PASSED"</span>
}</pre>

<h3>Asli process mein gate kahan baithta hai</h3>
<p>Gate har pull request par chalta hai aur change window se theek pehle phir, usi input par. Pass hone par push ki ijazat milti hai, jo aap pichhle modules ke surakshit tareeko se karte ho: <b>adv-pyez-config</b> (lock, diff, commit confirmed) ya <b>adv-netconf</b> (candidate, validate, confirmed commit). Push ke baad <b>adv-junos-validate</b> saabit karta hai ki live state wahi hai jo model ne bataya tha. Gate teen jaalon mein se pehla hai, akela nahi.</p>

<div class="warn"><p><b>Green gate kya saabit nahi karta.</b> Yeh sirf wahi configs check karta hai jo aapne diye. Agar live files se drift ho gaya, to model aise network ko describe karta hai jo hai hi nahi. Yeh cables, optics, wire par MTU, hardware limits ya vendor bug nahi dekh sakta. Schema nahi jaan sakta ki aapke platform par VLAN 4000 reserved hai. "Pre-checks pass hue" kaho, "safe" kabhi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jo script BLOCKED print karti hai par exit code 0 par khatam hoti hai woh gate nahi hai. Exit code hamesha <code>echo "exit code: $?"</code> se test karo, jaise lab karta hai.</p></div>

<div class="scn"><h4>Hamesha green rehne wala gate</h4><p>Ek team ne pipeline mein Batfish step jodi par uske baad "build kabhi na toote" isliye <code>|| true</code> likh diya. Chhe mahine baad audit mein chaudah merged changes mile jinke logs mein undefined references the. <code>|| true</code> hatane se build pehle hi din ek asli typo par toota.</p><p><b>Lesson:</b> jis check ko aap fail nahi kar sakte woh sajawat hai.</p></div>

<div class="iv"><p class="q">"Network changes ke liye pre-deployment gate design karo."</p><p>Kharche ke kram mein stages: request par schema, candidate configs par Batfish hygiene, intent ke against session checks, modelled state ka diff jisme intended farak whitelist ho, aur jo change vaada karta hai uske liye reachability traces. Reasons ke saath jaldi fail, JSON report likho, blocked ho to exit 1. Phir confirmed commit se push karo aur baad mein live state verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gate stages par ek loop hai jo reasons lautate hain, aur exit code contract hai.</li>
<li>Sasti checks pehle; Batfish tabhi kholo jab intent valid ho.</li>
<li>Intent se checks chalao: sessions, expected additions, traced prefixes.</li>
<li>Logon ke liye report likho; machines ke liye exit code use karo.</li>
<li>Green ka matlab pre-checks pass, safe nahi: commit-confirmed push aur post-check rakho.</li>
</ul></div>
`}};export{e as default};