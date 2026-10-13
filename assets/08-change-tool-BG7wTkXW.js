var e={id:`change-tool`,h:{en:`A change tool: YAML request, compare, apply, commit only if changed`,hi:`Change tool: YAML request, compare, apply, sirf badla ho to commit`},body:{en:`
<p>Now put the pieces together. A real change request says what the firewall should look like: these addresses, this group, this rule. A good tool reads that wish, looks at the firewall, changes only what is different and commits only if it changed something. Run it twice and the second run does nothing. That property is called <b>idempotent</b>, and it is what makes automation safe to retry.</p>

<div class="dia"><svg viewBox="0 0 640 158" role="img" aria-label="diagram">
<rect x="8" y="30" width="100" height="56" rx="10" fill="#bae6fd"/><text x="58" y="55" text-anchor="middle" class="svg-ink" font-size="13">request.yaml</text><text x="58" y="72" text-anchor="middle" class="svg-muted" font-size="11">what we want</text>
<rect x="132" y="30" width="110" height="56" rx="10" fill="#ddd6fe"/><text x="187" y="55" text-anchor="middle" class="svg-ink" font-size="13">refreshall</text><text x="187" y="72" text-anchor="middle" class="svg-muted" font-size="11">what is there</text>
<rect x="266" y="30" width="100" height="56" rx="10" fill="#fde68a"/><text x="316" y="55" text-anchor="middle" class="svg-ink" font-size="13">compare</text><text x="316" y="72" text-anchor="middle" class="svg-muted" font-size="11">differ?</text>
<rect x="390" y="8" width="110" height="40" rx="10" fill="#fed7aa"/><text x="445" y="33" text-anchor="middle" class="svg-ink" font-size="13">apply()</text>
<rect x="390" y="68" width="110" height="40" rx="10" fill="#e2e8f0"/><text x="445" y="93" text-anchor="middle" class="svg-ink" font-size="13">skip</text>
<rect x="524" y="8" width="108" height="40" rx="10" fill="#bbf7d0"/><text x="578" y="33" text-anchor="middle" class="svg-ink" font-size="12">commit(sync=True)</text>
<rect x="524" y="68" width="108" height="40" rx="10" fill="#bbf7d0"/><text x="578" y="93" text-anchor="middle" class="svg-ink" font-size="11">exit 0, no commit</text>
<line x1="108" y1="58" x2="132" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="242" y1="58" x2="266" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="366" y1="50" x2="390" y2="28" stroke="#64748b" stroke-width="2"/>
<line x1="366" y1="66" x2="390" y2="88" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="28" x2="524" y2="28" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="88" x2="524" y2="88" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Any PanDeviceError: print one line, exit 1.</text>
</svg><p class="cap">An idempotent tool compares first and writes only the difference.</p></div>

<h3>The request is data</h3>
<p>The wish lives in a YAML file that a human can review, so it can be approved before it runs. It names the change, the addresses, one group and one rule:</p>
<pre class="code">change: CHG-3107
addresses:
  - {name: web-srv, value: 10.20.0.10/32, description: Web server}
  - {name: web-srv2, value: 10.20.0.11/32, description: Web server 2}
  - {name: web-srv3, value: 10.20.0.12/32, description: Web server 3}
group: {name: web-pool, members: [web-srv, web-srv2, web-srv3]}
rule: {name: allow-web, from: trust, to: dmz, destination: web-pool, application: web-browsing}</pre>
<h3>Compare, then write the difference</h3>
<p>For every wanted address the tool reads what exists (<code>refreshall(fw, add=False)</code>) and compares value and description. If they match, it skips. Otherwise it applies the object and counts one change. Groups and rules follow the same pattern.</p>
<pre class="code">def ensure_addresses(fw, wanted):
    """Create or update the address objects that differ. Returns how many it changed."""
    have = {a.name: a for a in objects.AddressObject.refreshall(fw, add=False)}
    changed = 0
    for w in wanted:
        cur = have.get(w["name"])
        if cur and cur.value == w["value"] and cur.description == w.get("description"):
            continue
        fw.add(objects.AddressObject(w["name"], w["value"], description=w.get("description"))).apply()
        print("address %s: applied %s" % (w["name"], w["value"]))
        changed += 1
    return changed</pre>
<p>Two details matter. The comparison uses the fields you control, so a harmless difference you do not manage cannot cause a write. And the function returns the <b>number</b> of changes, because that number decides whether there will be a commit.</p>

<h3>Commit only when something changed, and say how it ended</h3>
<p>The main function adds the counts of the three steps. Zero means "already as requested": print that, return 0, and do not touch the firewall. Otherwise commit with <code>sync=True</code>, print the job id and map the outcome to an exit code. Any library error is caught at the top level, printed as one line, and turned into exit code 1.</p>
<pre class="code">def main(path):
    with open(path) as f:
        req = yaml.safe_load(f)
    fw = connect()
    changed = ensure_addresses(fw, req["addresses"]) + ensure_group(fw, req["group"]) + ensure_rule(fw, req["rule"])
    if not changed:
        print("%s: the firewall already matches the request, nothing to commit" % req["change"])
        return 0
    result = fw.commit(sync=True)
    print("%s: %d change(s), commit %s (job %s)" % (req["change"], changed, result["result"], result["jobid"]))
    return 0 if result["success"] else 1


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1]))
    except panos.PanDeviceError as err:
        print("fwchange: %s: %s" % (type(err).__name__, err))
        sys.exit(1)</pre>

<h3>The three runs that prove it</h3>
<pre class="out">$ python3 fwchange.py request.yaml; echo "exit code: $?"
address web-srv3: applied 10.20.0.12/32
group web-pool: applied ['web-srv', 'web-srv2', 'web-srv3']
CHG-3107: 2 change(s), commit OK (job 5)
exit code: 0

$ python3 fwchange.py request.yaml; echo "exit code: $?"
CHG-3107: the firewall already matches the request, nothing to commit
exit code: 0

$ PAN_API_KEY=bogus python3 fwchange.py request.yaml; echo "exit code: $?"
fwchange: PanDeviceXapiError: Invalid Credential
exit code: 1</pre>
<p>The first run found two differences (one new address and a group that needed the new member), applied only those, and committed. The second run compared, found nothing and exited without a commit; this is the idempotency check, and it also means a re-run after a failure is safe. The third run replaced the key for this one command only. A variable put in front of the command wins over the <code>.env</code> file, because <code>load_dotenv()</code> does not override. The bogus key was rejected, one clean line was printed, and the key itself did not appear anywhere. The exit code tells a scheduler or CI job what happened without parsing text.</p>

<div class="warn"><p><b>Common mistakes.</b> Committing every time, even with zero changes. Comparing fields in a different form from the one the library returns (a list against a string). Catching every exception and exiting 0. Printing the exception together with the request headers. Leaving the tool without an exit code.</p></div>
<div class="exam"><p><b>Exam trap.</b> Idempotent does not mean "never writes": it means a repeat of the same request produces the same end state and no further change. Exit code 0 here covers both "changed and committed" and "nothing to do"; the printed line tells them apart.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The tool manages three kinds of object and only creates or updates; it never deletes. A real tool also needs a delete policy (chapter 10 shows what happens when delete order is wrong), a commit lock check, and a place for the change record.</p></div>

<div class="scn"><h4>The nightly job that committed 200 times</h4><p>A nightly job applied the same request every night and always committed. The firewall's commit history filled with identical entries, and a real emergency change one night had to wait behind a queued commit. After the compare step was added, most nights showed "nothing to commit".</p><p><b>Lesson:</b> compare first. A commit is a shared, serial resource.</p></div>

<div class="iv"><p class="q">"What does idempotent mean for a firewall automation script, and how do you achieve it?"</p><p>Running it twice gives the same final state and the second run changes nothing. I read the current objects, compare them with the request, write only the difference and commit only when the number of changes is above zero. Then I return an exit code so a scheduler knows the result.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keep the wish in a reviewable YAML file and the logic in the script.</li>
<li>Read, compare, apply only the difference; count the changes.</li>
<li>No changes means no commit, and the second run proves it.</li>
<li>Exit 0 for success or nothing to do, exit 1 with one line for any firewall error.</li>
<li>A variable in front of the command overrides <code>.env</code>; never print the key.</li>
</ul></div>
`,hi:`
<p>Ab sab tukde jodte hain. Asli change request batati hai ki firewall kaisa dikhna chahiye: yeh addresses, yeh group, yeh rule. Achha tool us ichha ko padhta hai, firewall dekhta hai, sirf jo alag hai woh badalta hai aur kuch badla ho tabhi commit karta hai. Do baar chalao to doosri baar kuch nahi hota. Is gun ko <b>idempotent</b> kehte hain, aur isi se automation retry karne ke liye safe banta hai.</p>

<div class="dia"><svg viewBox="0 0 640 158" role="img" aria-label="diagram">
<rect x="8" y="30" width="100" height="56" rx="10" fill="#bae6fd"/><text x="58" y="55" text-anchor="middle" class="svg-ink" font-size="13">request.yaml</text><text x="58" y="72" text-anchor="middle" class="svg-muted" font-size="11">jo chahiye</text>
<rect x="132" y="30" width="110" height="56" rx="10" fill="#ddd6fe"/><text x="187" y="55" text-anchor="middle" class="svg-ink" font-size="13">refreshall</text><text x="187" y="72" text-anchor="middle" class="svg-muted" font-size="11">jo maujood hai</text>
<rect x="266" y="30" width="100" height="56" rx="10" fill="#fde68a"/><text x="316" y="55" text-anchor="middle" class="svg-ink" font-size="13">compare</text><text x="316" y="72" text-anchor="middle" class="svg-muted" font-size="11">alag hai?</text>
<rect x="390" y="8" width="110" height="40" rx="10" fill="#fed7aa"/><text x="445" y="33" text-anchor="middle" class="svg-ink" font-size="13">apply()</text>
<rect x="390" y="68" width="110" height="40" rx="10" fill="#e2e8f0"/><text x="445" y="93" text-anchor="middle" class="svg-ink" font-size="13">chhodo</text>
<rect x="524" y="8" width="108" height="40" rx="10" fill="#bbf7d0"/><text x="578" y="33" text-anchor="middle" class="svg-ink" font-size="12">commit(sync=True)</text>
<rect x="524" y="68" width="108" height="40" rx="10" fill="#bbf7d0"/><text x="578" y="93" text-anchor="middle" class="svg-ink" font-size="11">exit 0, commit nahi</text>
<line x1="108" y1="58" x2="132" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="242" y1="58" x2="266" y2="58" stroke="#64748b" stroke-width="2"/>
<line x1="366" y1="50" x2="390" y2="28" stroke="#64748b" stroke-width="2"/>
<line x1="366" y1="66" x2="390" y2="88" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="28" x2="524" y2="28" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="88" x2="524" y2="88" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Koi bhi PanDeviceError: ek line print karo, exit 1.</text>
</svg><p class="cap">Idempotent tool pehle compare karta hai aur sirf farak likhta hai.</p></div>

<h3>Request data hai</h3>
<p>Ichha ek YAML file mein rehti hai jise insaan review kar sakta hai, isliye chalne se pehle approve ho sakti hai. Usme change ka naam, addresses, ek group aur ek rule hai:</p>
<pre class="code">change: CHG-3107
addresses:
  - {name: web-srv, value: 10.20.0.10/32, description: Web server}
  - {name: web-srv2, value: 10.20.0.11/32, description: Web server 2}
  - {name: web-srv3, value: 10.20.0.12/32, description: Web server 3}
group: {name: web-pool, members: [web-srv, web-srv2, web-srv3]}
rule: {name: allow-web, from: trust, to: dmz, destination: web-pool, application: web-browsing}</pre>
<h3>Compare karo, phir sirf farak likho</h3>
<p>Har chahe gaye address ke liye tool jo maujood hai use padhta hai (<code>refreshall(fw, add=False)</code>) aur value aur description compare karta hai. Match ho to skip. Warna object apply karta hai aur ek change ginta hai. Groups aur rules bhi wahi pattern follow karte hain.</p>
<pre class="code">def ensure_addresses(fw, wanted):
    """Create or update the address objects that differ. Returns how many it changed."""
    have = {a.name: a for a in objects.AddressObject.refreshall(fw, add=False)}
    changed = 0
    for w in wanted:
        cur = have.get(w["name"])
        if cur and cur.value == w["value"] and cur.description == w.get("description"):
            continue
        fw.add(objects.AddressObject(w["name"], w["value"], description=w.get("description"))).apply()
        print("address %s: applied %s" % (w["name"], w["value"]))
        changed += 1
    return changed</pre>
<p>Do baatein zaroori hain. Comparison un fields par hai jo aap control karte ho, isliye jo farak aap manage nahi karte woh write nahi karwa sakta. Aur function changes ki <b>sankhya</b> lautata hai, kyunki wahi sankhya tay karti hai ki commit hoga ya nahi.</p>

<h3>Kuch badla ho tabhi commit, aur kaise khatam hua yeh batao</h3>
<p>Main function teeno steps ki counts jodta hai. Zero ka matlab "pehle se waisa hi hai": yeh print karo, 0 lautao, aur firewall ko chhoo mat. Warna <code>sync=True</code> se commit karo, job id print karo aur natije ko exit code mein badlo. Library ka koi bhi error sabse upar pakda jaata hai, ek line mein print hota hai aur exit code 1 ban jaata hai.</p>
<pre class="code">def main(path):
    with open(path) as f:
        req = yaml.safe_load(f)
    fw = connect()
    changed = ensure_addresses(fw, req["addresses"]) + ensure_group(fw, req["group"]) + ensure_rule(fw, req["rule"])
    if not changed:
        print("%s: the firewall already matches the request, nothing to commit" % req["change"])
        return 0
    result = fw.commit(sync=True)
    print("%s: %d change(s), commit %s (job %s)" % (req["change"], changed, result["result"], result["jobid"]))
    return 0 if result["success"] else 1


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1]))
    except panos.PanDeviceError as err:
        print("fwchange: %s: %s" % (type(err).__name__, err))
        sys.exit(1)</pre>

<h3>Teen runs jo saabit karte hain</h3>
<pre class="out">$ python3 fwchange.py request.yaml; echo "exit code: $?"
address web-srv3: applied 10.20.0.12/32
group web-pool: applied ['web-srv', 'web-srv2', 'web-srv3']
CHG-3107: 2 change(s), commit OK (job 5)
exit code: 0

$ python3 fwchange.py request.yaml; echo "exit code: $?"
CHG-3107: the firewall already matches the request, nothing to commit
exit code: 0

$ PAN_API_KEY=bogus python3 fwchange.py request.yaml; echo "exit code: $?"
fwchange: PanDeviceXapiError: Invalid Credential
exit code: 1</pre>
<p>Pehli run ko do farak mile (ek naya address aur ek group jisme naya member chahiye tha), sirf wahi apply kiye, aur commit kiya. Doosri run ne compare kiya, kuch nahi mila aur bina commit ke nikal gayi; yahi idempotency check hai, aur iska matlab hai ki failure ke baad re-run safe hai. Teesri run ne sirf ek command ke liye key badli. Command ke aage lagaya variable <code>.env</code> file par jeetta hai, kyunki <code>load_dotenv()</code> override nahi karta. Bogus key reject hui, ek saaf line print hui, aur key khud kahin nahi dikhi. Exit code scheduler ya CI job ko text parse kiye bina bata deta hai ki kya hua.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Har baar commit karna, chahe zero changes hon. Fields ko us roop mein compare karna jo library ke lautaye roop se alag hai (list ko string se). Har exception pakad kar 0 se exit karna. Exception ko request headers ke saath print karna. Tool ko bina exit code ke chhodna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Idempotent ka matlab "kabhi likhta nahi" nahi hai: matlab hai ki wahi request dohrane par same end state aur koi aur change nahi. Yahan exit code 0 "badla aur commit hua" aur "karne ko kuch nahi" dono ko cover karta hai; print hui line unhe alag karti hai.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Tool teen tarah ke objects manage karta hai aur sirf create ya update karta hai; kabhi delete nahi. Asli tool ko delete policy chahiye (chapter 10 dikhata hai ki delete order galat ho to kya hota hai), commit lock check chahiye, aur change record ke liye jagah.</p></div>

<div class="scn"><h4>Raat ka job jisne 200 baar commit kiya</h4><p>Ek raat ka job har raat wahi request apply karta tha aur hamesha commit karta tha. Firewall ki commit history ek jaise entries se bhar gayi, aur ek raat ek asli emergency change ko queue mein pade commit ke peeche rukna pada. Compare step jodne ke baad zyadatar raaton ko "nothing to commit" dikha.</p><p><b>Lesson:</b> pehle compare karo. Commit ek shared, serial resource hai.</p></div>

<div class="iv"><p class="q">"Firewall automation script ke liye idempotent ka kya matlab hai, aur use kaise paate ho?"</p><p>Do baar chalane par same final state aur doosri run kuch nahi badalti. Main maujooda objects padhta hoon, request se compare karta hoon, sirf farak likhta hoon aur commit tabhi karta hoon jab changes ki sankhya zero se zyada ho. Phir exit code deta hoon taaki scheduler ko result pata chale.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ichha ko review-yogya YAML file mein rakho aur logic ko script mein.</li>
<li>Padho, compare karo, sirf farak apply karo; changes gino.</li>
<li>Koi change nahi to commit nahi, aur doosri run yeh saabit karti hai.</li>
<li>Success ya karne ko kuch nahi par exit 0, kisi bhi firewall error par ek line ke saath exit 1.</li>
<li>Command ke aage ka variable <code>.env</code> ko override karta hai; key kabhi print mat karo.</li>
</ul></div>
`}};export{e as default};