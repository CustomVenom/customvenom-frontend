# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link "Yahoo":
        - /url: https://www.yahoo.com/
        - img "Yahoo" [ref=e5] [cursor=pointer]
    - generic [ref=e6]:
      - link "Help" [ref=e7] [cursor=pointer]:
        - /url: https://help.yahoo.com/kb/index?locale=en_US&page=product&y=PROD_ACCT
      - link "Terms" [ref=e8] [cursor=pointer]:
        - /url: https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html
      - link "Privacy" [ref=e9] [cursor=pointer]:
        - /url: https://legal.yahoo.com/us/en/yahoo/privacy/index.html
  - generic [ref=e12]:
    - heading "Uh oh" [level=1] [ref=e13]
    - paragraph [ref=e14]: Looks like something went wrong.
    - paragraph [ref=e15]: Please try again later.
    - button "Close" [ref=e17] [cursor=pointer]
    - paragraph [ref=e18]: "Developers: Please specify a valid client and submit again."
```