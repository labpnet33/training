var e={id:`firewall-pipeline`,h:{en:`Build C: a firewall change pipeline for FortiGate and PAN-OS`,hi:`Build C: FortiGate aur PAN-OS ke liye firewall change pipeline`},body:{en:`
<p>Build C is the same chain with different devices. A firewall change request arrives as a small YAML file; the toolkit checks it, shows what it would do on each firewall, applies it, and reads it back. It is a chapter and not a lab task because a lab hour is already full, but every listing below was run in the lab on a FortiGate (<code>adv-fw-rest</code>) and a PAN-OS firewall (<code>adv-fw-panos</code>) before it was written down.</p>

<h3>The request is the intent</h3>
<pre class="code">change: CHG-4001
servers:
  - {name: web1, ip: 10.20.0.10}
  - {name: web2, ip: 10.20.0.11}
group: WEB-POOL
service: https</pre>
<p>It says <i>what is wanted</i> in vendor-neutral words: two servers, a group, one service. It does not say <i>port2</i> or <i>trust</i>, and it does not contain the word "FortiOS". The vendor words belong in two small tables and two functions, which is exactly where the Junos and IOS differences lived in build A. The chapter reuses <code>fgt.py</code> from <code>adv-fw-rest</code> (a requests client with <code>find</code>, <code>differs</code> and <code>ensure</code>) and <code>panconf.py</code> from <code>adv-fw-panos</code>; the API keys come from the environment, as in those modules.</p>

<h3>Step 1: the gate for a request</h3>
<pre class="code">SCHEMA = {
    "type": "object", "required": ["change", "servers", "group", "service"], "additionalProperties": False,
    "properties": {
        "change": {"type": "string", "pattern": "^CHG-[0-9]+$"},
        "servers": {"type": "array", "minItems": 1, "items": {
            "type": "object", "required": ["name", "ip"],
            "properties": {"name": {"type": "string"}, "ip": {"type": "string", "format": "ipv4"}}}},
        "group": {"type": "string"},
        "service": {"enum": ["https", "ssh"]},
    },
}

def validate(req):
    validator = Draft202012Validator(SCHEMA, <span class="hl">format_checker=FormatChecker()</span>)
    return ["%s: %s" % ("/".join(str(p) for p in e.absolute_path) or "request", e.message) for e in validator.iter_errors(req)]</pre>
<pre class="out">AUTO01$ python3 fwpipe.py bad.yaml; echo "exit code: $?"
request: servers/0/ip: '10.20.0.300' is not a 'ipv4'
request: service: 'ftp' is not one of ['https', 'ssh']
bad.yaml blocked: 2 error(s), no firewall was contacted
exit code: 1</pre>
<p>The service list is a whitelist: the schema decides which services a request may ask for, so "ftp" never reaches a firewall. That is policy, and it lives in a file that goes through review.</p>

<h3>Step 2: render for each vendor</h3>
<pre class="code">FORTI_SERVICE = {"https": "HTTPS", "ssh": "SSH"}     # the same intent, each vendor's own word
PAN_APPLICATION = {"https": "ssl", "ssh": "ssh"}

def forti_items(req):
    items = [("firewall/address", {"name": s["name"], "subnet": s["ip"] + " 255.255.255.255", "comment": req["change"]}) for s in req["servers"]]
    items.append(("firewall/addrgrp", {"name": req["group"], "member": [{"name": s["name"]} for s in req["servers"]], "comment": req["change"]}))
    items.append(("firewall/policy", {"name": "allow-" + req["group"], "srcintf": [{"name": "port2"}], "dstintf": [{"name": "port1"}],
                                      "srcaddr": [{"name": "all"}], "dstaddr": [{"name": req["group"]}], "action": "accept",
                                      "schedule": "always", "service": [{"name": FORTI_SERVICE[req["service"]]}],
                                      "nat": "enable", "comments": req["change"]}))
    return items

def pan_items(req):
    names = [s["name"] for s in req["servers"]]
    items = [("address", objects.AddressObject(s["name"], s["ip"] + "/32", description=req["change"])) for s in req["servers"]]
    items.append(("group", objects.AddressGroup(req["group"], static_value=names, description=req["change"])))
    items.append(("rule", policies.SecurityRule("allow-" + req["group"], fromzone=["trust"], tozone=["dmz"], destination=[req["group"]],
                                                application=[PAN_APPLICATION[req["service"]]], action="allow", description=req["change"])))
    return items</pre>
<p>The change number goes into the comment of every object. Months later, <code>CHG-4001</code> is searchable on the firewall itself, and an object without a change number is a finding in the next audit. FortiOS wants a list of address objects for a group, PAN-OS wants a list of names; the dictionaries hide that from the request.</p>

<h3>Step 3: plan, apply and verify with one function per vendor</h3>
<pre class="code">def forti_run(req, apply):
    s = fgt.session()
    rows = []
    for path, body in forti_items(req):
        have = fgt.find(s, path, body["name"])
        state = "create" if have is None else ("update" if fgt.differs(have, body) else "ok")
<span class="hl">        if apply and state != "ok":
            state = fgt.ensure(s, path, body)[0]</span>
        rows.append(("FGT1", path, body["name"], state))
    return rows

def main(path, apply):
    ...
    rows = forti_run(req, apply) + pan_run(req, apply)
    for row in rows:
        print("%-5s %-17s %-14s %s" % row)
    if not apply:
        return 0
    left = [r for r in forti_run(req, False) + pan_run(req, False) if r[3] != "ok" and r[1] != "commit"]
    print("verify: %d difference(s) left" % len(left))
    return 1 if left else 0</pre>
<pre class="code">ATTRS = {"address": ("value", "description"), "group": ("static_value", "description"),
         "rule": ("fromzone", "tozone", "destination", "application")}

def pan_run(req, apply):
    fw = firewall.Firewall(HOST, api_key=api_key(), timeout=10)
    rulebase = fw.add(policies.Rulebase())
    have = {"address": objects.AddressObject.refreshall(fw, add=False), "group": objects.AddressGroup.refreshall(fw, add=False),
            "rule": policies.SecurityRule.refreshall(rulebase, add=False)}
    rows, changed = [], 0
    for kind, want in pan_items(req):
        cur = {o.name: o for o in have[kind]}.get(want.name)
        state = "create" if cur is None else ("ok" if all(sorted(getattr(cur, a) or []) == sorted(getattr(want, a) or []) if isinstance(getattr(want, a), list) else getattr(cur, a) == getattr(want, a) for a in ATTRS[kind]) else "update")
<span class="hl">        if apply and state != "ok":
            (rulebase if kind == "rule" else fw).add(want).apply()
            state += "d"
            changed += 1</span>
        rows.append(("PAN1", kind, want.name, state))
    if changed:
        job = fw.commit(sync=True)
        rows.append(("PAN1", "commit", "job " + str(job["jobid"]), job["result"]))
    return rows</pre>
<p>The PAN-OS function has the same shape with pan-os-python: it reads the three object types, marks each item create, update or ok, applies what differs, and commits once at the end, only when something changed. The keys come from the environment: the FortiGate key from <code>FGT_TOKEN</code>, the PAN-OS key from <code>PAN_API_KEY</code> in <code>.env</code>. The verify is the plan function run again: after a good apply every row must say <i>ok</i>.</p>
<pre class="out">AUTO01$ python3 fwpipe.py request.yaml --apply; echo "exit code: $?"
FGT1  firewall/address  web1           created
FGT1  firewall/address  web2           created
FGT1  firewall/addrgrp  WEB-POOL       created
FGT1  firewall/policy   allow-WEB-POOL created
PAN1  address           web1           created
PAN1  address           web2           created
PAN1  group             WEB-POOL       created
PAN1  rule              allow-WEB-POOL created
PAN1  commit            job 3          OK
verify: 0 difference(s) left
exit code: 0</pre>
<p>A second run prints <i>ok</i> on all eight rows and does not commit again: the same idempotence as build A.</p>

<div class="warn"><p><b>Design questions this lab listing does not answer.</b> (1) <i>Partial failure</i>: if FortiGate succeeds and PAN-OS fails, the request is half applied. Decide whether to stop after the first vendor, and write the created objects to <code>reports/CHG-4001.json</code> so that someone can reverse them. (2) <i>Rollback</i>: FortiOS applies immediately and has no candidate; PAN-OS has one, but its commit is a job that can fail. A pipeline needs a revert plan per vendor. (3) <i>Rule order</i>: an appended rule may sit below a deny; the verify here checks that the rule exists, not that it is reached. Name that limit in the design.</p></div>

<div class="scn"><h4>The rule nobody could explain</h4><p>An audit found 40 firewall rules without a change number. Nobody knew who had asked for them or whether they were still needed. A team rebuilt its change process so that requests were YAML files in a repository, the pipeline wrote the change number into every object, and a quarterly check listed objects without one. The first quarter removed 31 rules.</p><p><b>Lesson:</b> a request that is a file, with a number written into the device, is traceable. A rule typed on a console is not.</p></div>

<div class="iv"><p class="q">"How do you automate firewall changes across two vendors safely?"</p><p>One vendor-neutral request, validated by a schema with a whitelist of services. Small per-vendor functions render it, plan it, apply it and read it back, so a reviewer sees the diff before the apply. The change number goes into every object. The exit code reflects the verify, not the apply, and I decide in advance how a half-applied request is reversed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The request is the intent: vendor-neutral, schema-checked, with a whitelist of services.</li>
<li>Vendor words live in small tables and two functions; the request never contains them.</li>
<li>Plan, apply and verify share one function per vendor; a second run says ok everywhere.</li>
<li>Write the change number into every object, for audit and for reversal.</li>
<li>Design for partial failure and for rollback before the first real request.</li>
</ul></div>
`,hi:`
<p>Build C wahi chain hai, bas devices alag. Firewall change request chhoti YAML file ki shakl mein aati hai; toolkit use check karti hai, har firewall par dikhati hai ki kya karegi, apply karti hai aur wapas padhti hai. Yeh lab task nahi balki chapter hai kyunki lab ka ek ghanta pehle se bhara hai, par neeche ki har listing likhne se pehle lab mein ek FortiGate (<code>adv-fw-rest</code>) aur ek PAN-OS firewall (<code>adv-fw-panos</code>) par chalayi gayi.</p>

<h3>Request hi intent hai</h3>
<pre class="code">change: CHG-4001
servers:
  - {name: web1, ip: 10.20.0.10}
  - {name: web2, ip: 10.20.0.11}
group: WEB-POOL
service: https</pre>
<p>Yeh vendor-neutral shabdon mein batati hai <i>kya chahiye</i>: do servers, ek group, ek service. Isme <i>port2</i> ya <i>trust</i> nahi hai, aur "FortiOS" shabd bhi nahi. Vendor ke shabd do chhote tables aur do functions mein rehte hain, bilkul wahi jagah jahan build A mein Junos aur IOS ke fark rehte the. Chapter <code>adv-fw-rest</code> ka <code>fgt.py</code> (requests client jisme <code>find</code>, <code>differs</code> aur <code>ensure</code> hain) aur <code>adv-fw-panos</code> ka <code>panconf.py</code> reuse karta hai; API keys environment se aati hain, jaise un modules mein.</p>

<h3>Step 1: request ka gate</h3>
<pre class="code">SCHEMA = {
    "type": "object", "required": ["change", "servers", "group", "service"], "additionalProperties": False,
    "properties": {
        "change": {"type": "string", "pattern": "^CHG-[0-9]+$"},
        "servers": {"type": "array", "minItems": 1, "items": {
            "type": "object", "required": ["name", "ip"],
            "properties": {"name": {"type": "string"}, "ip": {"type": "string", "format": "ipv4"}}}},
        "group": {"type": "string"},
        "service": {"enum": ["https", "ssh"]},
    },
}

def validate(req):
    validator = Draft202012Validator(SCHEMA, <span class="hl">format_checker=FormatChecker()</span>)
    return ["%s: %s" % ("/".join(str(p) for p in e.absolute_path) or "request", e.message) for e in validator.iter_errors(req)]</pre>
<pre class="out">AUTO01$ python3 fwpipe.py bad.yaml; echo "exit code: $?"
request: servers/0/ip: '10.20.0.300' is not a 'ipv4'
request: service: 'ftp' is not one of ['https', 'ssh']
bad.yaml blocked: 2 error(s), no firewall was contacted
exit code: 1</pre>
<p>Service list whitelist hai: schema tay karta hai ki request kaunsi services maang sakti hai, isliye "ftp" firewall tak kabhi nahi pahunchta. Yeh policy hai, aur woh aisi file mein rehti hai jo review se guzarti hai.</p>

<h3>Step 2: har vendor ke liye render</h3>
<pre class="code">FORTI_SERVICE = {"https": "HTTPS", "ssh": "SSH"}     # the same intent, each vendor's own word
PAN_APPLICATION = {"https": "ssl", "ssh": "ssh"}

def forti_items(req):
    items = [("firewall/address", {"name": s["name"], "subnet": s["ip"] + " 255.255.255.255", "comment": req["change"]}) for s in req["servers"]]
    items.append(("firewall/addrgrp", {"name": req["group"], "member": [{"name": s["name"]} for s in req["servers"]], "comment": req["change"]}))
    items.append(("firewall/policy", {"name": "allow-" + req["group"], "srcintf": [{"name": "port2"}], "dstintf": [{"name": "port1"}],
                                      "srcaddr": [{"name": "all"}], "dstaddr": [{"name": req["group"]}], "action": "accept",
                                      "schedule": "always", "service": [{"name": FORTI_SERVICE[req["service"]]}],
                                      "nat": "enable", "comments": req["change"]}))
    return items

def pan_items(req):
    names = [s["name"] for s in req["servers"]]
    items = [("address", objects.AddressObject(s["name"], s["ip"] + "/32", description=req["change"])) for s in req["servers"]]
    items.append(("group", objects.AddressGroup(req["group"], static_value=names, description=req["change"])))
    items.append(("rule", policies.SecurityRule("allow-" + req["group"], fromzone=["trust"], tozone=["dmz"], destination=[req["group"]],
                                                application=[PAN_APPLICATION[req["service"]]], action="allow", description=req["change"])))
    return items</pre>
<p>Change number har object ke comment mein jata hai. Mahino baad <code>CHG-4001</code> firewall par hi search ho sakta hai, aur change number ke bina object agle audit ka finding hai. FortiOS group ke liye address objects ki list chahta hai, PAN-OS naamon ki list; dictionaries request se yeh fark chhupa deti hain.</p>

<h3>Step 3: har vendor ka ek function: plan, apply, verify</h3>
<pre class="code">def forti_run(req, apply):
    s = fgt.session()
    rows = []
    for path, body in forti_items(req):
        have = fgt.find(s, path, body["name"])
        state = "create" if have is None else ("update" if fgt.differs(have, body) else "ok")
<span class="hl">        if apply and state != "ok":
            state = fgt.ensure(s, path, body)[0]</span>
        rows.append(("FGT1", path, body["name"], state))
    return rows

def main(path, apply):
    ...
    rows = forti_run(req, apply) + pan_run(req, apply)
    for row in rows:
        print("%-5s %-17s %-14s %s" % row)
    if not apply:
        return 0
    left = [r for r in forti_run(req, False) + pan_run(req, False) if r[3] != "ok" and r[1] != "commit"]
    print("verify: %d difference(s) left" % len(left))
    return 1 if left else 0</pre>
<pre class="code">ATTRS = {"address": ("value", "description"), "group": ("static_value", "description"),
         "rule": ("fromzone", "tozone", "destination", "application")}

def pan_run(req, apply):
    fw = firewall.Firewall(HOST, api_key=api_key(), timeout=10)
    rulebase = fw.add(policies.Rulebase())
    have = {"address": objects.AddressObject.refreshall(fw, add=False), "group": objects.AddressGroup.refreshall(fw, add=False),
            "rule": policies.SecurityRule.refreshall(rulebase, add=False)}
    rows, changed = [], 0
    for kind, want in pan_items(req):
        cur = {o.name: o for o in have[kind]}.get(want.name)
        state = "create" if cur is None else ("ok" if all(sorted(getattr(cur, a) or []) == sorted(getattr(want, a) or []) if isinstance(getattr(want, a), list) else getattr(cur, a) == getattr(want, a) for a in ATTRS[kind]) else "update")
<span class="hl">        if apply and state != "ok":
            (rulebase if kind == "rule" else fw).add(want).apply()
            state += "d"
            changed += 1</span>
        rows.append(("PAN1", kind, want.name, state))
    if changed:
        job = fw.commit(sync=True)
        rows.append(("PAN1", "commit", "job " + str(job["jobid"]), job["result"]))
    return rows</pre>
<p>PAN-OS function isi shape mein pan-os-python ke saath chalta hai: teen object types padhta hai, har item ko create, update ya ok mark karta hai, jo alag ho use apply karta hai, aur ant mein ek baar commit karta hai, sirf tab jab kuch badla ho. Keys environment se aati hain: FortiGate key <code>FGT_TOKEN</code> se, PAN-OS key <code>.env</code> ke <code>PAN_API_KEY</code> se. Verify wahi plan function dobara chalana hai: achhe apply ke baad har row <i>ok</i> kehni chahiye.</p>
<pre class="out">AUTO01$ python3 fwpipe.py request.yaml --apply; echo "exit code: $?"
FGT1  firewall/address  web1           created
FGT1  firewall/address  web2           created
FGT1  firewall/addrgrp  WEB-POOL       created
FGT1  firewall/policy   allow-WEB-POOL created
PAN1  address           web1           created
PAN1  address           web2           created
PAN1  group             WEB-POOL       created
PAN1  rule              allow-WEB-POOL created
PAN1  commit            job 3          OK
verify: 0 difference(s) left
exit code: 0</pre>
<p>Doosri run aathon rows par <i>ok</i> print karti hai aur dobara commit nahi karti: build A wali hi idempotence.</p>

<div class="warn"><p><b>Design ke sawal jo yeh lab listing hal nahi karti.</b> (1) <i>Partial failure</i>: FortiGate safal ho aur PAN-OS fail, to request aadhi lagi hai. Tay karo ki pehle vendor ke baad ruk jaye, aur banaye objects <code>reports/CHG-4001.json</code> mein likho taaki koi unhe reverse kar sake. (2) <i>Rollback</i>: FortiOS turant apply karta hai aur candidate nahi rakhta; PAN-OS mein candidate hai par commit ek job hai jo fail ho sakta hai. Pipeline ko har vendor ka revert plan chahiye. (3) <i>Rule order</i>: jodi gayi rule deny ke neeche ho sakti hai; yahan verify check karta hai ki rule hai, yeh nahi ki woh hit hoti hai. Design mein yeh limit likho.</p></div>

<div class="scn"><h4>Woh rule jise koi samjha nahi paya</h4><p>Audit mein 40 firewall rules bina change number ke mili. Kisi ko pata nahi tha kisne maangi thi ya abhi zaroorat hai ya nahi. Ek team ne change process aise banaya ki requests repository mein YAML files thin, pipeline har object mein change number likhti thi, aur quarterly check bina number ke objects ki list nikalta tha. Pehli quarter mein 31 rules hata di gayin.</p><p><b>Lesson:</b> file ki shakl mein request, jiska number device mein likha ho, traceable hai. Console par type hui rule nahi.</p></div>

<div class="iv"><p class="q">"Do vendors ke firewalls par changes safely kaise automate karoge?"</p><p>Ek vendor-neutral request, schema se validate, services ki whitelist ke saath. Chhote per-vendor functions use render, plan, apply aur read back karte hain, taaki reviewer apply se pehle diff dekhe. Change number har object mein jata hai. Exit code apply nahi verify ko dikhata hai, aur aadhi lagi request ko kaise reverse karna hai yeh pehle se tay karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Request hi intent hai: vendor-neutral, schema-checked, services ki whitelist ke saath.</li>
<li>Vendor ke shabd chhote tables aur do functions mein; request mein kabhi nahi.</li>
<li>Plan, apply aur verify har vendor ka ek function share karte hain; doosri run har jagah ok kehti hai.</li>
<li>Change number har object mein likho, audit aur reversal ke liye.</li>
<li>Pehli asli request se pehle partial failure aur rollback ka design karo.</li>
</ul></div>
`}};export{e as default};