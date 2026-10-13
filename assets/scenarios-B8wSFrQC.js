var e=[{title:{en:`Single quotes in the inventory`,hi:`Inventory mein single quotes`},ticket:{en:`show_inv.py fails to load the file. The validator output is below. What is wrong?`,hi:`show_inv.py file load nahi kar pati. Validator ka output neeche hai. Kya galat hai?`},out:`AUTO> json validate inventory.json
inventory.json: INVALID JSON
  line 15, column 18: strings must use double quotes ("), not single quotes (')
   15 |       "mgmt_ip": '10.99.0.2',
      |                  ^`,q:{en:`What is the correct fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Remove the comma at the end of line 15`,hi:`Line 15 ke end ka comma hatao`},{en:`Use double quotes around the value: "mgmt_ip": "10.99.0.2",`,hi:`Value ke aaspaas double quotes lagao: "mgmt_ip": "10.99.0.2",`},{en:`Change "mgmt_ip" to a number`,hi:`"mgmt_ip" ko number mein badlo`},{en:`Convert the file to YAML first`,hi:`Pehle file ko YAML mein convert karo`}],a:1,w:{en:`JSON allows only double-quoted strings. Replace the single quotes and keep the comma, because another key follows.`,hi:`JSON sirf double-quoted strings allow karta hai. Single quotes badlo aur comma rakho, kyunki aage aur key hai.`}},{title:{en:`A comma before the closing brace`,hi:`Closing brace se pehle comma`},ticket:{en:`After the first fix, the validator reports this. Which line must be edited?`,hi:`Pehle fix ke baad validator yeh report karta hai. Kaun si line edit karni hai?`},out:`AUTO> json validate inventory.json
inventory.json: INVALID JSON
  line 25, column 5: trailing comma is not allowed before '}'
   25 |     }
      |     ^

   23        "vlans": [10, 20],
   24        "managed": false,
   25      }`,q:{en:`Where is the real mistake?`,hi:`Asli galti kahan hai?`},o:[{en:`Line 25, the closing brace should be deleted`,hi:`Line 25, closing brace delete karni chahiye`},{en:`Line 24: remove the comma after false`,hi:`Line 24: false ke baad ka comma hatao`},{en:`Line 23: add a comma after the list`,hi:`Line 23: list ke baad comma jodo`},{en:`The whole device block must be removed`,hi:`Poora device block hatana chahiye`}],a:1,w:{en:`A comma may only separate items. The last item "managed": false must not end with a comma, so the fix is on line 24 although the error is reported on line 25.`,hi:`Comma sirf items ko alag karta hai. Aakhri item "managed": false comma par khatam nahi hona chahiye, isliye fix line 24 par hai bhale hi error line 25 par report hui.`}},{title:{en:`Valid JSON, still a KeyError`,hi:`Valid JSON, phir bhi KeyError`},ticket:{en:`The JSON validates, but the script stops as shown. What explains it?`,hi:`JSON validate ho jaata hai, lekin script dikhaye anusaar ruk jaati hai. Kya explain karta hai?`},out:`AUTO> json validate inventory.json
inventory.json: valid JSON (object with 3 top-level key(s): company, site, devices)

AUTO> python3 show_inv.py
Company: Deccan Net | Site: Hyderabad
NAME        ROLE    MGMT IP       VLANS
Traceback (most recent call last):
  File "show_inv.py", line 12
    print(dev['name'], dev['role'], dev['mgmt'], dev['vlans'])
KeyError: 'mgmt'`,q:{en:`What should you change?`,hi:`Aapko kya badalna chahiye?`},o:[{en:`Make the JSON file larger`,hi:`JSON file ko bada karo`},{en:`Install a newer jq`,hi:`Naya jq install karo`},{en:`Replace json.load with json.dump`,hi:`json.load ko json.dump se badlo`},{en:`The script should use the real key name mgmt_ip`,hi:`Script ko asli key naam mgmt_ip use karna chahiye`}],a:3,w:{en:`The file is valid, and the data uses the key mgmt_ip. KeyError names the key that the code asked for but that does not exist. Align the code with the data.`,hi:`File valid hai, aur data key mgmt_ip use karta hai. KeyError us key ka naam batata hai jo code ne maangi par exist nahi karti. Code ko data ke saath align karo.`}},{title:{en:`The dash one space too far`,hi:`Dash ek space zyada daayein`},ticket:{en:`build.py fails to load vlans.yml. The linter output and the lines are shown. What is wrong?`,hi:`build.py vlans.yml load nahi kar pati. Linter output aur lines dikhaye gaye hain. Kya galat hai?`},out:`AUTO> yamllint vlans.yml
vlans.yml:11:4: error: bad indentation of a sequence entry (this line is indented more than the list item above it)

    9    - id: 10
   10      name: OFFICE
   11     - id: 20
   12      name: SCANNERS`,q:{en:`How do you fix it?`,hi:`Ise kaise fix karte ho?`},o:[{en:`Align the dash on line 11 with the other list items (two spaces before the dash)`,hi:`Line 11 ka dash baaki list items ke saath align karo (dash se pehle do spaces)`},{en:`Add quotes around every value`,hi:`Har value ke aaspaas quotes lagao`},{en:`Use a tab on line 11`,hi:`Line 11 par tab use karo`},{en:`Delete line 10`,hi:`Line 10 delete karo`}],a:0,w:{en:`YAML structure comes from indentation. Every item of the list must start at the same column; line 11 has one extra space. Tabs are not allowed.`,hi:`YAML structure indentation se aata hai. List ka har item ek hi column se shuru hona chahiye; line 11 mein ek extra space hai. Tabs allowed nahi.`}},{title:{en:`The country that turned False`,hi:`Country jo False ban gayi`},ticket:{en:`A report prints this after loading a YAML file. Why did NO become False?`,hi:`YAML file load karne ke baad report yeh print karti hai. NO False kyun ban gaya?`},out:`branches.yml:
  - city: Oslo
    country: NO

python3 show.py
Oslo False`,q:{en:`What is the safest fix?`,hi:`Sabse safe fix kya hai?`},o:[{en:`Write the country in lowercase no`,hi:`Country ko lowercase no mein likho`},{en:`Convert the file to XML`,hi:`File ko XML mein convert karo`},{en:`Quote the value in the YAML file: country: "NO"`,hi:`YAML file mein value quote karo: country: "NO"`},{en:`Remove the city key`,hi:`city key hatao`}],a:2,w:{en:`Older YAML rules treat unquoted yes, no, on and off as booleans (the Norway problem). Quote values that must remain text.`,hi:`Purane YAML rules bina quotes ke yes, no, on aur off ko booleans maante hain (Norway problem). Jo values text hi rehni chahiye unhe quote karo.`}},{title:{en:`Second VLAN of the first device`,hi:`Pehle device ka doosra VLAN`},ticket:{en:`A colleague needs the second VLAN of the first device in this file. Which jq path gives it?`,hi:`Ek colleague ko is file mein pehle device ka doosra VLAN chahiye. Kaun sa jq path deta hai?`},out:`{
  "site": "Hyderabad",
  "devices": [
    {"name": "HYD-CORE1", "vlans": [10, 20, 30]},
    {"name": "HYD-EDGE1", "vlans": [99]}
  ]
}`,q:{en:`Which command is correct?`,hi:`Kaun sa command sahi hai?`},o:[{en:`jq '.devices[1].vlans[0]' file.json`,hi:`jq '.devices[1].vlans[0]' file.json`},{en:`jq '.vlans[1]' file.json`,hi:`jq '.vlans[1]' file.json`},{en:`jq '.devices[0].vlans[2]' file.json`,hi:`jq '.devices[0].vlans[2]' file.json`},{en:`jq '.devices[0].vlans[1]' file.json`,hi:`jq '.devices[0].vlans[1]' file.json`}],a:3,w:{en:`Counting starts at 0. devices[0] is HYD-CORE1 and vlans[1] is its second item, 20.`,hi:`Ginti 0 se shuru hoti hai. devices[0] HYD-CORE1 hai aur vlans[1] uska doosra item, 20.`}},{title:{en:`yaml.load raises a TypeError`,hi:`yaml.load TypeError raise karta hai`},ticket:{en:`A script copied from an old tutorial fails as shown. What is the right change?`,hi:`Purane tutorial se copy ki script dikhaye anusaar fail hoti hai. Sahi change kya hai?`},out:`import yaml
with open("vlans.yml") as f:
    plan = yaml.load(f)

TypeError: load() missing 1 required positional argument: 'Loader'`,q:{en:`What should the code use?`,hi:`Code ko kya use karna chahiye?`},o:[{en:`json.loads(f)`,hi:`json.loads(f)`},{en:`yaml.safe_load(f)`,hi:`yaml.safe_load(f)`},{en:`yaml.load(f, Loader=None)`,hi:`yaml.load(f, Loader=None)`},{en:`yaml.dump(f)`,hi:`yaml.dump(f)`}],a:1,w:{en:`Current PyYAML requires an explicit Loader for load. The safe, recommended choice for data files is yaml.safe_load, which builds only plain data types.`,hi:`Maujooda PyYAML load ke liye explicit Loader maangta hai. Data files ke liye safe, recommended choice yaml.safe_load hai, jo sirf plain data types banata hai.`}}];export{e as default};